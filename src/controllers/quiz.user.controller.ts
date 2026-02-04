import { Request, Response } from 'express'
import { supabase } from '../lib/supabase'

export async function getQuizByTopic(req: Request, res: Response) {
  const { topicId } = req.params

  if (!topicId) {
    return res.status(400).json({ error: 'topicId required' })
  }

  const { data, error } = await supabase
    .from('quiz_questions')
    .select(`
      id,
      question_text,
      question_type,
      question_order,
      quiz_options (
        id,
        option_text,
        option_order
      )
    `)
    .eq('topic_id', topicId)
    .eq('is_final_exam', false)
    .order('question_order', { ascending: true })

  if (error) {
    return res.status(400).json({ error: error.message })
  }

  res.json(data)
}

export async function submitQuiz(req: Request, res: Response) {
  try {
    const userId = req.user!.userId
    const { courseId, topicId, isFinalExam, answers, timeTaken } = req.body

    if (!answers?.length) {
      return res.status(400).json({ error: 'Answers required' })
    }

    const questionIds = answers.map((a: any) => a.questionId)

    const { data: correctOptions } = await supabase
      .from('quiz_options')
      .select('id, question_id')
      .eq('is_correct', true)
      .in('question_id', questionIds)

    let correctCount = 0

    const answerRows = answers.map((a: any) => {
      const isCorrect = correctOptions?.some(
        o => o.id === a.selectedOptionId
      )
      if (isCorrect) correctCount++

      return {
        question_id: a.questionId,
        selected_option_id: a.selectedOptionId,
        is_correct: isCorrect,
      }
    })

    const score = Math.round((correctCount / answers.length) * 100)
    const passed = score >= 70

    const { data: scoreRow, error } = await supabase
      .from('quiz_scores')
      .insert({
        user_id: userId,
        course_id: courseId,
        topic_id: isFinalExam ? null : topicId,
        is_final_exam: isFinalExam,
        score,
        passed,
        time_taken_seconds: timeTaken,
      })
      .select()
      .single()

    if (error) return res.status(400).json({ error: error.message })

    await supabase
      .from('quiz_answers')
      .insert(
        answerRows.map((a: typeof answerRows[0]) => ({
          ...a,
          score_id: scoreRow.id,
        }))
      )

    res.json({ score, passed, scoreId: scoreRow.id })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}


export async function getMyQuizAttempts(req: Request, res: Response) {
  const userId = req.user!.userId

  const { data, error } = await supabase
    .from('quiz_scores')
    .select(`
      id,
      course_id,
      topic_id,
      is_final_exam,
      score,
      passed,
      time_taken_seconds,
      created_at
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    return res.status(400).json({ error: error.message })
  }

  res.json(data)
}