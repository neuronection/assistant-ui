---
'@neuronection/assistant-ui': minor
---

Phase-4 file-attachment surface (presentational; upload controllers stay
app-side): `UploadDropzone` (block/row variants, drag events + file-picker
results out via `onFiles`, optional folder picker, uploading state),
`FileCard` (name/size/status/thumbnail, remove, include-in-processing
toggle) and `FileQueue` (aggregate summary, drag-to-reorder intent via
`onReorder(fromId, toId)`).
