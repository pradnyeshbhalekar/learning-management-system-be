import { Request, Response } from 'express'
import * as CategoriesService from '../services/categories.service'

export async function getCategories(
  _req: Request,
  res: Response
) {
  const categories = await CategoriesService.getAllCategories()
  res.json(categories)
}

export async function createCategory(
  req: Request,
  res: Response
) {
  const { name, description } = req.body

  if (!name) {
    return res.status(400).json({ error: 'Name is required' })
  }

  const category = await CategoriesService.createCategory({
    name,
    description,
  })

  res.status(201).json(category)
}

export async function updateCategory(
  req: Request,
  res: Response
) {
  const categoryId = String(req.params.id)
  const { name, description } = req.body

  if (!name) {
    return res.status(400).json({ error: 'Name is required' })
  }

  const category = await CategoriesService.updateCategory(
    categoryId,
    { name, description }
  )

  res.json(category)
}

export async function deleteCategory(
  req: Request,
  res: Response
) {
  const categoryId = String(req.params.id)

  await CategoriesService.deleteCategory(categoryId)

  res.json({ success: true })
}