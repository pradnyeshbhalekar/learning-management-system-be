// src/controllers/quiz.user.controller.ts
import { Request, Response } from 'express'
import { supabase } from '../lib/supabase'

/* =========================
   GET QUIZ BY COURSE
========================= */
export async function getQuizByCourse(req: Request, res: Response) {
  const { courseId } = req.params

  const { data: quiz } = await supabase
    .from('quizzes')
    .select('id, title, total_marks, passing_marks')
    .eq('course_id', courseId)
    .single()

  if (!quiz) {
    return res.status(404).json({ error: 'Quiz not found' })
  }

  const { data: questions, error } = await supabase
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
    .eq('quiz_id', quiz.id)
    .order('question_order')

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.json({
    quiz,
    questions,
  })
}




/* =========================
   TYPES
========================= */
type QuizAnswerInput = {
  question_id: string
  option_id: string
}

/* =========================
   SUBMIT QUIZ (COURSE-LEVEL)
========================= */
export async function submitQuiz(req: Request, res: Response) {
  try {
    const userId = req.user!.userId
    const { courseId } = req.params
    const { answers, timeTaken } = req.body as {
      answers: QuizAnswerInput[]
      timeTaken?: number
    }

    if (!answers || answers.length === 0) {
      return res.status(400).json({ error: 'Answers are required' })
    }

    /* 1️⃣ Get quiz for course */
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .select('id, passing_marks')
      .eq('course_id', courseId)
      .single()

    if (quizError || !quiz) {
      return res.status(404).json({ error: 'Quiz not found for course' })
    }

    /* 2️⃣ Prevent re-attempt if already passed */
    const { data: passedAttempt } = await supabase
      .from('quiz_attempts')
      .select('id')
      .eq('quiz_id', quiz.id)
      .eq('user_id', userId)
      .eq('passed', true)
      .maybeSingle()

    if (passedAttempt) {
      return res.status(400).json({ error: 'Quiz already passed' })
    }

    /* 3️⃣ Fetch correct options */
    const questionIds = answers.map((a) => a.question_id)

    const { data: correctOptions, error: optionsError } = await supabase
      .from('quiz_options')
      .select('id')
      .eq('is_correct', true)
      .in('question_id', questionIds)

    if (optionsError) {
      return res.status(500).json({ error: optionsError.message })
    }

    /* 4️⃣ Evaluate answers */
    let correctCount = 0

    const answerRows = answers.map((a) => {
      const isCorrect =
        correctOptions?.some((o) => o.id === a.option_id) ?? false

      if (isCorrect) correctCount++

      return {
        question_id: a.question_id,
        selected_option_id: a.option_id,
        is_correct: isCorrect,
      }
    })

    const score = Math.round((correctCount / answers.length) * 100)
    const passed = score >= quiz.passing_marks

    /* 5️⃣ Create quiz attempt */
    const { data: attempt, error: attemptError } = await supabase
      .from('quiz_attempts')
      .insert({
        quiz_id: quiz.id,
        user_id: userId,
        score,
        passed,
        time_taken_seconds: timeTaken ?? null,
      })
      .select()
      .single()

    if (attemptError || !attempt) {
      console.error(attemptError)
      return res.status(500).json({ error: 'Failed to create attempt' })
    }

    /* 6️⃣ Store answers */
    const { error: answersError } = await supabase
      .from('quiz_answers')
      .insert(
        answerRows.map((a) => ({
          ...a,
          attempt_id: attempt.id,
        }))
      )

    if (answersError) {
      console.error(answersError)
      return res.status(500).json({ error: 'Failed to save answers' })
    }

    /* 7️⃣ Response */
    res.json({
      score,
      passed,
      attemptId: attempt.id,
    })
  } catch (err: any) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
}
/* =========================
   GET MY ATTEMPTS
========================= */
export async function getMyQuizAttempts(req: Request, res: Response) {
  const userId = req.user!.userId

  const { data, error } = await supabase
    .from('quiz_attempts')
    .select(`
      id,
      quiz_id,
      score,
      total_points,
      is_passed,
      attempted_at
    `)
    .eq('user_id', userId)
    .order('attempted_at', { ascending: false })

  if (error) {
    return res.status(400).json({ error: error.message })
  }

  res.json(data)
}