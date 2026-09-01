import { useState } from 'react'
import { UploadDropzone } from '../src/components/upload-dropzone/UploadDropzone'
import { FileCard } from '../src/components/file-card/FileCard'
import { FileQueue, type FileQueueItem } from '../src/components/file-queue/FileQueue'

export const Dropzones = () => {
  const [busy, setBusy] = useState(false)
  const [names, setNames] = useState<string[]>([])
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 480 }}>
      <UploadDropzone
        onFiles={(files) => {
          setBusy(true)
          setNames(files.map((f) => f.name))
          setTimeout(() => setBusy(false), 600)
        }}
        uploading={busy}
        hint="PDF or images up to 10 MB"
      />
      <UploadDropzone onFiles={() => {}} variant="row" label="Drop resume" hint="PDF only" />
      <UploadDropzone onFiles={() => {}} allowFolders label="Drop a folder" />
      {names.length > 0 ? <p style={{ fontSize: 13 }}>Picked: {names.join(', ')}</p> : null}
    </div>
  )
}

export const FileQueueStory = () => {
  const [files, setFiles] = useState<FileQueueItem[]>([
    { id: 'f1', name: 'bloodwork.pdf', sizeBytes: 244000, status: 'done' },
    { id: 'f2', name: 'scan.png', sizeBytes: 1280000, status: 'processing', included: true },
    { id: 'f3', name: 'notes.txt', sizeBytes: 900, status: 'failed', error: 'Unsupported', included: false },
    { id: 'f4', name: 'x-ray.dcm', sizeBytes: 8200000 },
  ])
  return (
    <FileQueue
      files={files}
      onRemove={(id) => setFiles((current) => current.filter((f) => f.id !== id))}
      onToggleInclude={(id) =>
        setFiles((current) =>
          current.map((f) => (f.id === id ? { ...f, included: f.included === false } : f)),
        )
      }
      onReorder={(fromId, toId) =>
        setFiles((current) => {
          const from = current.findIndex((f) => f.id === fromId)
          const to = current.findIndex((f) => f.id === toId)
          const next = [...current]
          next.splice(to, 0, next.splice(from, 1)[0]!)
          return next
        })
      }
    />
  )
}

export const FileCardStory = () => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
    <FileCard name="bloodwork.pdf" sizeBytes={244000} status="done" onRemove={() => {}} />
    <FileCard
      name="scan.png"
      sizeBytes={1280000}
      status="processing"
      included
      onToggleInclude={() => {}}
      onRemove={() => {}}
    />
    <FileCard
      name="notes.txt"
      sizeBytes={900}
      status="failed"
      error="Unsupported format"
      included={false}
      onToggleInclude={() => {}}
    />
  </div>
)
