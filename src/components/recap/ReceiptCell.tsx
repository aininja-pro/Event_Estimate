import { useState, useRef } from 'react'
import { Paperclip, FileText, X, Loader2 } from 'lucide-react'
import { uploadReceipt, getReceiptUrl, deleteReceipt } from '@/lib/receipt-service'
import type { ReceiptAttachment } from '@/types/workflow'

interface ReceiptCellProps {
  estimateId: string
  lineItemId: string
  receipt: ReceiptAttachment | null
  onUploadComplete: (receipt: ReceiptAttachment) => void
  onDeleteComplete: (lineItemId: string) => void
}

export function ReceiptCell({
  estimateId,
  lineItemId,
  receipt,
  onUploadComplete,
  onDeleteComplete,
}: ReceiptCellProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      const attachment = await uploadReceipt(estimateId, lineItemId, file)
      onUploadComplete(attachment)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
      // Reset input so same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function handleView() {
    if (!receipt) return
    try {
      const url = await getReceiptUrl(receipt.file_path)
      window.open(url, '_blank')
    } catch (err) {
      console.error('Failed to get receipt URL:', err)
    }
  }

  async function handleDelete() {
    if (!receipt) return
    try {
      await deleteReceipt(receipt.id, receipt.file_path)
      onDeleteComplete(lineItemId)
    } catch (err) {
      console.error('Failed to delete receipt:', err)
    }
  }

  if (uploading) {
    return <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground/60 mx-auto" />
  }

  if (receipt) {
    return (
      <div className="flex items-center gap-0.5 justify-center">
        <button
          onClick={handleView}
          className="flex items-center gap-0.5 text-[10px] text-blue-600 hover:text-blue-800 transition-colors truncate max-w-[60px]"
          title={receipt.file_name}
        >
          <FileText className="h-3 w-3 shrink-0" />
          <span className="truncate">{receipt.file_name.split('.').pop()?.toUpperCase()}</span>
        </button>
        <button
          onClick={handleDelete}
          className="text-muted-foreground/40 hover:text-red-500 transition-colors"
          title="Remove receipt"
        >
          <X className="h-2.5 w-2.5" />
        </button>
      </div>
    )
  }

  return (
    <>
      <button
        onClick={() => fileInputRef.current?.click()}
        className="text-muted-foreground/40 hover:text-foreground/70 transition-colors mx-auto block"
        title="Attach receipt"
      >
        <Paperclip className="h-3.5 w-3.5" />
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.xlsx,.csv"
        onChange={handleUpload}
        className="hidden"
      />
      {error && <p className="text-[9px] text-red-500 text-center">{error}</p>}
    </>
  )
}
