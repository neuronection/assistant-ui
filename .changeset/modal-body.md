---
'@neuronection/assistant-ui': minor
---

Add `ModalBody` to the `Modal` compound: a padded body region (`px-6 pb-6`,
mergable via className, `data-as="modal-body"`) that sits between
`ModalHeader` (`p-6 pb-4`) and `ModalFooter` (`p-6 pt-0`). The modal layout
now owns its full spacing — consumers no longer hand-roll `px-6 pb-6`
wrappers on the content between header and footer (this was the de-facto
pattern in every family app, and `FormModal` already used it internally).
Story + docs + tests updated; no visual regression in existing usage.
