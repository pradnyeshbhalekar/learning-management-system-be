import { Request, Response } from 'express'
import { Readable } from 'node:stream'
import { supabase } from '../lib/supabase'

interface Topic {
  id: string
  course_id: string
  video_url: string | null
}

interface Course {
  id: string
  is_published: boolean
}

/* ---------------- helpers ---------------- */

async function getTopic(topicId: string): Promise<Topic | null> {
  const { data, error } = await supabase
    .from('topics')
    .select('id, course_id, video_url')
    .eq('id', topicId)
    .single()

  if (error || !data) return null
  return data
}

async function getCourse(courseId: string): Promise<Course | null> {
  const { data, error } = await supabase
    .from('courses')
    .select('id, is_published')
    .eq('id', courseId)
    .single()

  if (error || !data) return null
  return data
}

async function getVideoPath(topicId: string): Promise<string | null> {
  const { data } = await supabase
    .from('videos')
    .select('video_path')
    .eq('topic_id', topicId)
    .single()

  if (data?.video_path) return data.video_path

  const topic = await getTopic(topicId)
  return topic?.video_url ?? null
}

/* ---------------- controllers ---------------- */

export async function streamVideo(req: Request, res: Response) {
  try {
    const topicId = req.query.topicId as string | undefined
    const directUrl = req.query.url as string | undefined

    if (!topicId && !directUrl) {
      return res.status(400).json({ error: 'topicId or url is required' })
    }

    let videoUrl: string | null = null

    // Case 1: direct URL streaming (no DB)
    if (directUrl) {
      videoUrl = directUrl
    }

    // Case 2: topic-based streaming
    if (!videoUrl && topicId) {
      videoUrl = await getVideoPath(topicId)
    }

    if (!videoUrl) {
      return res.status(404).json({ error: 'Video not found' })
    }

    // Only validate topic + course if topicId exists
    if (topicId) {
      const topic = await getTopic(topicId)
      if (!topic) return res.status(404).json({ error: 'Topic not found' })

      const course = await getCourse(topic.course_id)
      if (!course) return res.status(404).json({ error: 'Course not found' })
    }

    // Sign Supabase storage path if needed
    if (!videoUrl.startsWith('http')) {
      const { data } = await supabase.storage
        .from('videos')
        .createSignedUrl(videoUrl, 60)

      if (!data?.signedUrl) {
        return res.status(400).json({ error: 'Invalid video path' })
      }

      videoUrl = data.signedUrl
    }

    const headers: any = {
      'User-Agent': req.headers['user-agent'] || '',
    }

    if (req.headers.range) {
      headers.Range = req.headers.range
    }

    const upstream = await fetch(videoUrl, { headers })

    if (!upstream.ok && upstream.status !== 206) {
      return res.status(500).json({ error: 'Failed to fetch video' })
    }

    res.status(upstream.status)
    res.setHeader(
      'Content-Type',
      upstream.headers.get('content-type') || 'video/mp4'
    )
    res.setHeader('Accept-Ranges', 'bytes')

    if (!upstream.body) {
  return res.status(500).json({ error: 'No video stream' })
}

Readable.fromWeb(upstream.body as any).pipe(res)
  } catch (err) {
    console.error('streamVideo error', err)
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error' })
    }
  }
}

export async function getSignedUrl(req: Request, res: Response) {
  try {
    const topicId = req.query.topicId as string

    if (!topicId) {
      return res.status(400).json({ error: 'Missing topicId' })
    }

    const videoPath = await getVideoPath(topicId)
    if (!videoPath) {
      return res.status(404).json({ error: 'Video not found' })
    }

    if (videoPath.startsWith('http')) {
      return res.json({ url: videoPath, expiresIn: null })
    }

    const { data, error } = await supabase.storage
      .from('videos')
      .createSignedUrl(videoPath, 3600)

    if (error || !data?.signedUrl) {
      return res.status(500).json({ error: 'Failed to sign URL' })
    }

    res.json({ url: data.signedUrl, expiresIn: 3600 })
  } catch (err) {
    console.error('getSignedUrl error', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export async function createVideo(req: Request, res: Response) {
  try {
    const { title, url, courseId } = req.body

    if (!title || !url || !courseId) {
      return res.status(400).json({ error: 'title, url, courseId required' })
    }

    const { count } = await supabase
      .from('topics')
      .select('*', { count: 'exact', head: true })
      .eq('course_id', courseId)

    const orderIndex = (count ?? 0) + 1

    const { data: topic, error } = await supabase
      .from('topics')
      .insert({
        title,
        video_url: url,
        course_id: courseId,
        order_index: orderIndex,
      })
      .select()
      .single()

    if (error || !topic) {
      return res.status(500).json({ error: 'Failed to create topic' })
    }

    let videoPath = url
    const match = url.match(/storage\/v1\/object\/(?:public|sign)\/[^/]+\/(.+)/)
    if (match) videoPath = match[1]

    await supabase.from('videos').insert({
      topic_id: topic.id,
      title,
      video_path: videoPath,
    })

    res.status(201).json({ data: topic })
  } catch (err) {
    console.error('createVideo error', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export async function updateVideo(req: Request, res: Response) {
  const topicId = req.params.id
  const { title, url } = req.body

  if (!title && !url) {
    return res.status(400).json({
      error: 'Nothing to update',
    })
  }

  // update topic
  const { data: topic, error } = await supabase
    .from('topics')
    .update({
      ...(title && { title }),
      ...(url && { video_url: url }),
    })
    .eq('id', topicId)
    .select()
    .single()

  if (error || !topic) {
    return res.status(500).json({ error: 'Failed to update topic' })
  }

  // optionally update videos table
  if (url) {
    let videoPath = url
    const match = url.match(/storage\/v1\/object\/(?:public|sign)\/[^/]+\/(.+)/)
    if (match) videoPath = match[1]

    await supabase
      .from('videos')
      .update({ video_path: videoPath })
      .eq('topic_id', topicId)
  }

  res.json({ data: topic })
}