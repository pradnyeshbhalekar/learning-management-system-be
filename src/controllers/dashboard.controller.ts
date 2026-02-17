import { Request, Response } from 'express'
import * as DashboardService from '../services/dashboard.service'

export async function getDashboardStats(req: Request, res: Response) {
  const userId = req.user!.userId

  try {
    const [
      enrolled,
      topicsCompleted,
      coursesCompleted,
      watchTimeSeconds,
    ] = await Promise.all([
      DashboardService.getEnrollmentCount(userId),
      DashboardService.getCompletedTopicCount(userId),
      DashboardService.getCompletedCourseCount(userId),
      DashboardService.getTotalWatchTime(userId),
    ])

    res.json({
      enrolled,
      topicsCompleted,
      coursesCompleted,
      watchTimeSeconds,
    })
  } catch (err) {
    console.error('Dashboard stats error:', err)
    res.status(500).json({ error: 'Failed to load dashboard stats' })
  }
}