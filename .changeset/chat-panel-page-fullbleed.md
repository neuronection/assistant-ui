---
'@neuronection/assistant-ui': minor
---

ChatPanel `page` variant is now a full-bleed shell: the host no longer centers
itself with `mx-auto max-w-3xl` — header, banner and composer bar span the
whole page and only the transcript region and the composer body sit in a
centered `max-w-3xl` column. App pages hosting the page variant integrate with
the surrounding route chrome (full-width header/dividers) instead of floating
as a narrow centered card. Sidebar and bubble variants are unchanged.
