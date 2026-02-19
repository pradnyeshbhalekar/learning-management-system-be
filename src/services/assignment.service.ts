import { supabaseAdmin } from '../lib/supabase'

export async function uploadAssignmentFile(
  assignmentId: string,
  userId: string,
  file: Express.Multer.File
): Promise<string> {
  const filePath = `${assignmentId}/${userId}/${Date.now()}-${file.originalname}`

  const { error } = await supabaseAdmin.storage
    .from('assignments')
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    })

  if (error) {
    throw error
  }

  const { data } = supabaseAdmin.storage
    .from('assignments')
    .getPublicUrl(filePath)

  return data.publicUrl
}