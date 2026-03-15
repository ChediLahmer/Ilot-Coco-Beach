import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = (supabaseUrl && supabaseKey && supabaseUrl !== 'https://placeholder.supabase.co')
  ? createClient(supabaseUrl, supabaseKey)
  : null

export async function getGalleryImages() {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('images')
    .select('*')
    .eq('section', 'gallery')
    .order('sort_order', { ascending: true })
  if (error) { console.error('Supabase error:', error); return [] }
  return data || []
}

export async function uploadImage(file, section = 'gallery') {
  if (!supabase) return null
  const ext = file.name.split('.').pop()
  const fileName = `${section}/${Date.now()}.${ext}`
  const { data: upload, error: uploadError } = await supabase.storage
    .from('images')
    .upload(fileName, file, { cacheControl: '3600', upsert: false })
  if (uploadError) { console.error('Upload error:', uploadError); return null }
  const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(fileName)
  const { data: record, error: dbError } = await supabase
    .from('images')
    .insert({ url: publicUrl, section, sort_order: Date.now() })
    .select()
    .single()
  if (dbError) { console.error('DB error:', dbError); return null }
  return record
}

export async function deleteImage(id, url) {
  if (!supabase) return false
  const path = url.split('/storage/v1/object/public/images/')[1]
  if (path) await supabase.storage.from('images').remove([path])
  const { error } = await supabase.from('images').delete().eq('id', id)
  return !error
}
