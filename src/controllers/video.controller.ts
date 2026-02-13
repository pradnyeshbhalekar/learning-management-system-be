import { Request, Response } from 'express'
import { Readable } from 'node:stream'
import { supabaseAdmin } from '../lib/supabase'
import { supabase } from '../lib/supabase'
import type { Multer } from 'multer'

import crypto from 'node:crypto'
export async function uploadVideo(req: Request, res: Response) {
  try {
    const file = req.file
    const { topicId, courseId, title } = req.body

    if (!file || !topicId || !courseId) {
      return res.status(400).json({
        error: 'file, topicId, courseId required',
      })
    }

    // 1. Validate topic belongs to course
    const { data: topic } = await supabaseAdmin
      .from('topics')
      .select('id, course_id')
      .eq('id', topicId)
      .single()

    if (!topic) {
      return res.status(404).json({ error: 'Topic not found' })
    }

    if (topic.course_id !== courseId) {
      return res.status(400).json({
        error: 'Topic does not belong to course',
      })
    }

    // 2. Generate storage path
    const ext = file.originalname.split('.').pop()
    const videoId = crypto.randomUUID()

    const storagePath = `topic-videos/${topicId}/${videoId}.${ext}`

    // 3. Upload to Supabase Storage
    const { error: uploadError } = await supabaseAdmin.storage
      .from('videos')
      .upload(storagePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      })

    if (uploadError) {
      console.error(uploadError)
      return res.status(500).json({ error: 'Upload failed' })
    }

    // 4. Save DB record
    const { data: video, error: dbError } = await supabaseAdmin
      .from('videos')
      .insert({
        id: videoId,
        title: title ?? file.originalname,
        topic_id: topicId,
        video_path: storagePath,
      })
      .select()
      .single()

    if (dbError || !video) {
      console.error(dbError)
      return res.status(500).json({ error: 'Failed to save video' })
    }

    // 5. Done
    res.status(201).json(video)
  } catch (err) {
    console.error('uploadVideo crashed', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}

/* ---------------- helpers ---------------- */

async function getTopic(topicId: string) {
  const { data } = await supabase
    .from('topics')
    .select('id, course_id')
    .eq('id', topicId)
    .single()

  return data ?? null
}

async function getCourse(courseId: string) {
  const { data } = await supabase
    .from('courses')
    .select('id, is_published')
    .eq('id', courseId)
    .single()

  return data ?? null
}

async function getVideoByTopic(topicId: string) {
  const { data } = await supabase
    .from('videos')
    .select('video_path')
    .eq('topic_id', topicId)
    .limit(1)
    .single()

  return data?.video_path ?? null
}

/* ---------------- controllers ---------------- */

export async function createVideo(req: Request, res: Response) {
  const { title, url, courseId, topicId } = req.body

  if (!title || !url || !courseId || !topicId) {
    return res.status(400).json({ error: 'Missing fields' })
  }

  const topic = await getTopic(topicId)
  if (!topic) return res.status(404).json({ error: 'Topic not found' })
  if (topic.course_id !== courseId) {
    return res.status(400).json({ error: 'Topic does not belong to course' })
  }

  const match = url.match(/storage\/v1\/object\/(?:public|sign)\/[^/]+\/(.+)/)
  const videoPath = match ? match[1] : url

  const { data, error } = await supabaseAdmin
    .from('videos')
    .upsert(
      {
        title,
        topic_id: topicId,
        video_path: videoPath,
      },
      { onConflict: 'topic_id' }
    )
    .select()
    .single()

  if (error) {
    console.error('VIDEO INSERT ERROR:', error)
    return res.status(500).json({ error: error.message })
  }

  res.status(201).json(data)
}

export async function streamVideo(req: Request, res: Response) {
  try {
    const topicId = req.query.topicId as string | undefined
    const directUrl = req.query.url as string | undefined

    if (!topicId && !directUrl) {
      return res.status(400).json({ error: 'topicId or url required' })
    }

    let videoUrl: string | null = null

    // 1️⃣ Direct URL override (debug / internal use)
    if (directUrl) {
      videoUrl = directUrl
    }

    // 2️⃣ Resolve via topic
    if (topicId) {
      const topic = await getTopic(topicId)
      if (!topic) return res.status(404).json({ error: 'Topic not found' })

      const course = await getCourse(topic.course_id)
      if (!course) return res.status(404).json({ error: 'Course not found' })

      const videoPath = await getVideoByTopic(topicId)
      if (!videoPath) return res.status(404).json({ error: 'Video not found' })

      videoUrl = videoPath
    }

    if (!videoUrl) {
      return res.status(404).json({ error: 'Video not found' })
    }

    // 3️⃣ Convert storage path → signed URL
    if (!videoUrl.startsWith('http')) {
      const { data } = await supabase.storage
        .from('videos')
        .createSignedUrl(videoUrl, 60)

      if (!data?.signedUrl) {
        return res.status(400).json({ error: 'Invalid video path' })
      }

      videoUrl = data.signedUrl
    }

    // 4️⃣ Forward RANGE header
    const headers: Record<string, string> = {}
    if (req.headers.range) {
      headers.Range = req.headers.range
    }

    const upstream = await fetch(videoUrl, { headers })

    const isRangeRequest = !!req.headers.range

    if (!upstream.ok) {
      console.error('Upstream fetch failed:', upstream.status)
      return res.status(500).json({ error: 'Failed to fetch video' })
    }

    // 🚨 CRITICAL: Browser expects 206 when Range is used
    if (isRangeRequest && upstream.status !== 206) {
      console.error(
        'Range request expected 206 but got',
        upstream.status
      )
      return res.status(416).end()
    }

    // 5️⃣ Forward essential headers
    res.status(upstream.status)

    const contentType = upstream.headers.get('content-type')
    const contentLength = upstream.headers.get('content-length')
    const contentRange = upstream.headers.get('content-range')

    if (contentType) res.setHeader('Content-Type', contentType)
    if (contentLength) res.setHeader('Content-Length', contentLength)
    if (contentRange) res.setHeader('Content-Range', contentRange)

    res.setHeader('Accept-Ranges', 'bytes')

    // 🚨 REQUIRED to avoid Cloudflare / Render buffering hell
    res.setHeader('Cache-Control', 'no-store')

    // 6️⃣ Stream to client
    Readable.fromWeb(upstream.body as any).pipe(res)
  } catch (err) {
    console.error('streamVideo crashed:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}


export async function updateVideo(req: Request, res: Response) {
  try {
    const videoId = req.params.id
    const { title, url } = req.body

    if (!title && !url) {
      return res.status(400).json({ error: 'Nothing to update' })
    }

    let update: any = {}
    if (title) update.title = title

    if (url) {
      const match = url.match(/storage\/v1\/object\/(?:public|sign)\/[^/]+\/(.+)/)
      update.video_path = match ? match[1] : url
    }

    const { data, error } = await supabase
      .from('videos')
      .update(update)
      .eq('id', videoId)
      .select()
      .single()

    if (error || !data) {
      return res.status(500).json({ error: 'Failed to update video' })
    }

    res.json(data)
  } catch (err) {
    console.error('updateVideo crashed', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}