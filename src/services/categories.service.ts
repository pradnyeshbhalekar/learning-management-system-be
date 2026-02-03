import { supabase, supabaseAdmin } from '../lib/supabase'
import { Category } from '../models/category.model'

export async function getAllCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  if (error) {
    throw new Error(error.message)
  }

  return data as Category[]
}

export async function createCategory(input: {
  name: string
  description?: string
}): Promise<Category> {
  const slug = input.name
    .toLowerCase()
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '')

  const { data, error } = await supabaseAdmin
    .from('categories')
    .insert({
      name: input.name,
      description: input.description ?? null,
      slug,
    })
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data as Category
}

export async function updateCategory(
  categoryId: string,
  input: {
    name: string
    description?: string
  }
): Promise<Category> {
  const slug = input.name
    .toLowerCase()
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '')

  const { data, error } = await supabaseAdmin
    .from('categories')
    .update({
      name: input.name,
      description: input.description ?? null,
      slug,
    })
    .eq('id', categoryId)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data as Category
}

export async function deleteCategory(
  categoryId: string
): Promise<void> {
  const { error } = await supabaseAdmin
    .from('categories')
    .delete()
    .eq('id', categoryId)

  if (error) {
    throw new Error(error.message)
  }
}