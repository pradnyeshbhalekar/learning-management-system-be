import { Request, Response } from 'express'
import * as DashboardService from '../services/dashboard.service'
import { getCurrentStreak } from '../services/streak.service'
import { supabaseAdmin } from '../lib/supabase'

export async function getDashboardStats(req: Request, res: Response) {
  const userId = req.user!.userId

  try {
    const [
      enrolled,
      topicsCompleted,
      coursesCompleted,
      watchTimeSeconds,
      streak,
      certificates,
    ] = await Promise.all([
      DashboardService.getEnrollmentCount(userId),
      DashboardService.getCompletedTopicCount(userId),
      DashboardService.getCompletedCourseCount(userId),
      DashboardService.getTotalWatchTime(userId),
      getCurrentStreak(userId),
      supabaseAdmin.from('certificates').select('id, course_id, issued_at').eq('user_id', userId)
    ])

    res.json({
      enrolled,
      topicsCompleted,
      coursesCompleted,
      watchTimeSeconds,
      streak,
      certificates: certificates?.data || []
    })
  } catch (err) {
    console.error('Dashboard stats error:', err)
    res.status(500).json({ error: 'Failed to load dashboard stats' })
  }
}