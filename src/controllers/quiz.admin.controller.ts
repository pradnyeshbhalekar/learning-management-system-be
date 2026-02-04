import { Request, Response } from 'express'
import { supabase } from '../lib/supabase'

// GET questions (admin view)
export async function getQuestions(req: Request, res: Response) {
  const { topicId, courseId } = req.query

  let query = supabase
    .from('quiz_questions')
    .select(`
      id,
      topic_id,
      course_id,
      is_final_exam,
      question_text,
      question_order,
      question_type,
      quiz_options (
        id,
        option_text,
        option_order,
        is_correct
      )
    `)
    .order('question_order')

  if (topicId) query.eq('topic_id', topicId)
  if (courseId) query.eq('course_id', courseId)

  const { data, error } = await query

  if (error) return res.status(400).json({ error: error.message })
  res.json(data)
}

// CREATE question
export async function createQuestion(req: Request, res: Response) {
  const {
    topic_id,
    course_id,
    question_text,
    question_type,
    question_order,
    is_final_exam = false,
    options,
  } = req.body

  if (!question_text || !course_id || !options?.length) {
    return res.status(400).json({ error: 'Invalid payload' })
  }

  const { data: question, error } = await supabase
    .from('quiz_questions')
    .insert({
      topic_id: is_final_exam ? null : topic_id,
      course_id,
      question_text,
      question_type,
      question_order,
      is_final_exam,
    })
    .select()
    .single()

  if (error) return res.status(400).json({ error: error.message })

  const optionRows = options.map((o: any, i: number) => ({
    question_id: question.id,
    option_text: o.option_text,
    is_correct: o.is_correct,
    option_order: i + 1,
  }))

  const { error: optErr } = await supabase
    .from('quiz_options')
    .insert(optionRows)

  if (optErr) return res.status(400).json({ error: optErr.message })

  res.status(201).json(question)
}

// UPDATE question
export async function updateQuestion(req: Request, res: Response) {
  const { id } = req.params
  const { question_text, question_type, question_order, options } = req.body

  const { error } = await supabase
    .from('quiz_questions')
    .update({ question_text, question_type, question_order })
    .eq('id', id)

  if (error) return res.status(400).json({ error: error.message })

  if (options?.length) {
    await supabase.from('quiz_options').delete().eq('question_id', id)

    const rows = options.map((o: any, i: number) => ({
      question_id: id,
      option_text: o.option_text,
      is_correct: o.is_correct,
      option_order: i + 1,
    }))

    const { error } = await supabase.from('quiz_options').insert(rows)
    if (error) return res.status(400).json({ error: error.message })
  }

  res.json({ success: true })
}

// DELETE question
export async function deleteQuestion(req: Request, res: Response) {
  const { id } = req.params

  await supabase.from('quiz_options').delete().eq('question_id', id)
  const { error } = await supabase.from('quiz_questions').delete().eq('id', id)

  if (error) return res.status(400).json({ error: error.message })
  res.json({ success: true })
}