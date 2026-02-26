import { Request, Response } from 'express'
import { Readable } from 'node:stream'
import { supabaseAdmin } from '../lib/supabase'
import { supabase } from '../lib/supabase'
import type { Multer } from 'multer'


import crypto from 'node:crypto'



export async function uploadVideo(req: Request, res: Response) {
  try {
    const file = req.file
    const body = req.body || {}
const topicId = body.topicId
const courseId = body.courseId
const title = body.title

console.log('FILE:', req.file)
console.log('BODY:', req.body)

    if (!file || !topicId || !courseId) {
      return res.status(400).json({
        error: 'file, topicId, courseId required',
      })
    }

    // validate topic
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

    // generate storage path
    const ext = file.originalname.split('.').pop()
    const videoId = crypto.randomUUID()
    const storagePath = `topic-videos/${topicId}/${videoId}.${ext}`

    // upload to storage
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

    // insert DB record (IMPORTANT: insert, not upsert)
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





export async function streamVideo(req: Request, res: Response) {
  try {
    const videoId = req.params.videoId

    // fetch video record
    const { data: video } = await supabase
      .from('videos')
      .select('video_path')
      .eq('id', videoId)
      .single()

    if (!video) {
      return res.status(404).json({ error: 'Video not found' })
    }

    // create signed URL
    const { data } = await supabase.storage
      .from('videos')
      .createSignedUrl(video.video_path, 60)

    if (!data?.signedUrl) {
      return res.status(500).json({ error: 'Failed to sign video URL' })
    }

    // forward range header
    const headers: Record<string, string> = {}
    if (req.headers.range) {
      headers.Range = req.headers.range
    }

    const upstream = await fetch(data.signedUrl, { headers })

    if (!upstream.ok) {
      return res.status(500).json({ error: 'Failed to fetch video stream' })
    }

    // forward headers
    res.status(upstream.status)
    res.setHeader('Content-Type', upstream.headers.get('content-type') ?? '')
    res.setHeader('Accept-Ranges', 'bytes')

    const contentRange = upstream.headers.get('content-range')
    if (contentRange) res.setHeader('Content-Range', contentRange)

    const contentLength = upstream.headers.get('content-length')
    if (contentLength) res.setHeader('Content-Length', contentLength)

    res.setHeader('Cache-Control', 'no-store')

    // stream body
    Readable.fromWeb(upstream.body as any).pipe(res)
  } catch (err) {
    console.error('streamVideo crashed', err)
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