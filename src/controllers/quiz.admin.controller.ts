import { Request, Response } from 'express'
import { supabase } from '../lib/supabase'
import { supabaseAdmin } from '../lib/supabase'


/* =========================
   GET QUESTIONS BY QUIZ
   ========================= */
export async function getQuestions(req: Request, res: Response) {
  const { quizId } = req.query

  if (!quizId) {
    return res.status(400).json({ error: 'quizId is required' })
  }

  const { data, error } = await supabase
    .from('quiz_questions')
    .select(`
      id,
      quiz_id,
      question_text,
      question_type,
      question_order,
      quiz_options (
        id,
        option_text,
        option_order,
        is_correct
      )
    `)
    .eq('quiz_id', quizId)
    .order('question_order')

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.json(data)
}

/* =========================
   CREATE QUESTION
   ========================= */
export async function createQuestion(req: Request, res: Response) {
  const {
    quiz_id,
    question_text,
    question_type,
    question_order,
    options,
  } = req.body

  if (!quiz_id || !question_text || !question_type || !options?.length) {
    return res.status(400).json({ error: 'Invalid payload' })
  }

  // 1. Create question
  const { data: question, error } = await supabase
    .from('quiz_questions')
    .insert({
      quiz_id,
      question_text,
      question_type,
      question_order,
    })
    .select()
    .single()

  if (error || !question) {
    return res.status(500).json({ error: error?.message })
  }

  // 2. Insert options
  const optionRows = options.map((o: any, idx: number) => ({
    question_id: question.id,
    option_text: o.option_text,
    is_correct: o.is_correct,
    option_order: idx + 1,
  }))

  const { error: optErr } = await supabase
    .from('quiz_options')
    .insert(optionRows)

  if (optErr) {
    return res.status(500).json({ error: optErr.message })
  }

  res.status(201).json(question)
}

/* =========================
   UPDATE QUESTION
   ========================= */
export async function updateQuestion(req: Request, res: Response) {
  const questionId = req.params.id
  const { question_text, question_type, question_order, options } = req.body

  if (!questionId) {
    return res.status(400).json({ error: 'questionId is required' })
  }

  const { error } = await supabase
    .from('quiz_questions')
    .update({
      ...(question_text && { question_text }),
      ...(question_type && { question_type }),
      ...(question_order !== undefined && { question_order }),
    })
    .eq('id', questionId)

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  // Replace options if provided
  if (Array.isArray(options)) {
    await supabase.from('quiz_options').delete().eq('question_id', questionId)

    const rows = options.map((o: any, idx: number) => ({
      question_id: questionId,
      option_text: o.option_text,
      is_correct: o.is_correct,
      option_order: idx + 1,
    }))

    const { error: optErr } = await supabase
      .from('quiz_options')
      .insert(rows)

    if (optErr) {
      return res.status(500).json({ error: optErr.message })
    }
  }

  res.json({ success: true })
}

/* =========================
   DELETE QUESTION
   ========================= */
export async function deleteQuestion(req: Request, res: Response) {
  const questionId = req.params.id

  if (!questionId) {
    return res.status(400).json({ error: 'questionId is required' })
  }

  await supabase.from('quiz_options').delete().eq('question_id', questionId)

  const { error } = await supabase
    .from('quiz_questions')
    .delete()
    .eq('id', questionId)

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.json({ success: true })
}

export async function getQuizByCourse(req: Request, res: Response) {
  const { courseId } = req.params

  const { data, error } = await supabase
    .from('quizzes')
    .select('*')
    .eq('course_id', courseId)
    .single()

  if (error || !data) {
    return res.status(404).json({ error: 'Quiz not found for course' })
  }

  res.json(data)
}

export async function createQuiz(req: Request, res: Response) {
  const { course_id, title, total_marks, passing_marks } = req.body

  if (!course_id || !title || total_marks == null || passing_marks == null) {
    return res.status(400).json({ error: 'Invalid payload' })
  }

  if (passing_marks > total_marks) {
    return res.status(400).json({
      error: 'passing_marks cannot be greater than total_marks',
    })
  }

  const { data, error } = await supabaseAdmin
    .from('quizzes')
    .insert({
      course_id,
      title,
      total_marks,
      passing_marks,
    })
    .select()
    .single()

  if (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to create quiz' })
  }

  res.status(201).json(data)
}