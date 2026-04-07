import { supabase } from './supabase'
import type { ReceiptAttachment } from '../types/workflow'

function requireSupabase() {
  if (!supabase) {
    throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
  }
  return supabase
}

const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
]

const MAX_SIZE = 10 * 1024 * 1024 // 10MB

function validateFile(file: File): string | null {
  if (file.size > MAX_SIZE) {
    return `File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum is 10MB.`
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'File type not allowed. Accepted: PDF, JPG, PNG, XLSX, CSV.'
  }
  return null
}

export async function uploadReceipt(
  estimateId: string,
  lineItemId: string,
  file: File,
  uploadedBy?: string
): Promise<ReceiptAttachment> {
  const db = requireSupabase()

  const validationError = validateFile(file)
  if (validationError) throw new Error(validationError)

  const filePath = `receipts/${estimateId}/${lineItemId}/${Date.now()}_${file.name}`

  const { error: uploadErr } = await db.storage
    .from('receipts')
    .upload(filePath, file)
  if (uploadErr) throw uploadErr

  const { data, error } = await db
    .from('receipt_attachments')
    .insert({
      estimate_id: estimateId,
      line_item_id: lineItemId,
      file_name: file.name,
      file_path: filePath,
      file_size: file.size,
      mime_type: file.type,
      uploaded_by: uploadedBy || null,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getReceipts(lineItemId: string): Promise<ReceiptAttachment[]> {
  const db = requireSupabase()
  const { data, error } = await db
    .from('receipt_attachments')
    .select('*')
    .eq('line_item_id', lineItemId)
  if (error) throw error
  return data
}

export async function getReceiptsByEstimate(estimateId: string): Promise<ReceiptAttachment[]> {
  const db = requireSupabase()
  const { data, error } = await db
    .from('receipt_attachments')
    .select('*')
    .eq('estimate_id', estimateId)
  if (error) throw error
  return data
}

export async function getReceiptUrl(filePath: string): Promise<string> {
  const db = requireSupabase()
  const { data, error } = await db.storage
    .from('receipts')
    .createSignedUrl(filePath, 3600)
  if (error) throw error
  return data.signedUrl
}

export async function deleteReceipt(id: string, filePath: string): Promise<void> {
  const db = requireSupabase()

  const { error: storageErr } = await db.storage
    .from('receipts')
    .remove([filePath])
  if (storageErr) throw storageErr

  const { error } = await db
    .from('receipt_attachments')
    .delete()
    .eq('id', id)
  if (error) throw error
}
