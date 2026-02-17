import { Request, Response } from 'express'
import * as DashboardService from '../services/dashboard.service'
import { getCurrentStreak } from '../services/streak.service'

export async function getDashboardStats(req: Request, res: Response) {
  const userId = req.user!.userId

  try {
    const [
      enrolled,
      topicsCompleted,
      coursesCompleted,
      watchTimeSeconds,
      streak,
    ] = await Promise.all([
      DashboardService.getEnrollmentCount(userId),
      DashboardService.getCompletedTopicCount(userId),
      DashboardService.getCompletedCourseCount(userId),
      DashboardService.getTotalWatchTime(userId),
      getCurrentStreak(userId),
    ])

    res.json({
      enrolled,
      topicsCompleted,
      coursesCompleted,
      watchTimeSeconds,
      streak,
    })
  } catch (err) {
    console.error('Dashboard stats error:', err)
    res.status(500).json({ error: 'Failed to load dashboard stats' })
  }
}