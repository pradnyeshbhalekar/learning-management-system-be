import jwt from 'jsonwebtoken'
import { supabase } from '../lib/supabase'

const JWT_SECRET = process.env.EXTERNAL_JWT_SECRET as string

export async function loginUser(email: string, password: string) {
  // 1. Fetch user from Supabase table
  const { data: user, error } = await supabase
    .from('users')
    .select('id, email, password, role')
    .eq('email', email)
    .single()

  if (error || !user) {
    throw new Error('Invalid credentials')
  }
  // 2. Password check (replace with bcrypt later)
  if (user.password !== password) {
    throw new Error('Invalid credentials')
  }

  // 3. Create JWT
  const token = jwt.sign(
    {
      userId: user.id,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  )

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  }
}
export async function getCurrentUser(userId: string) {
  const { data: user, error } = await supabase
    .from('users')
    .select(`
      id,
      email,
      full_name,
      avatar_url,
      bio
    `)
    .eq('id', userId)
    .single()

  if (error || !user) {
    // This is expected in devAuth mode
    return null
  }

  const { count } = await supabase
    .from('enrollments')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  return {
    ...user,
    enrolledCourses: count ?? 0,
  }
}