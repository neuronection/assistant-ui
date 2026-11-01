---
'@neuronection/assistant-ui': patch
---

ModelRegistry: a catalog pick no longer re-classifies an explicitly declared kind — choosing a standalone kind card (or standalone chip) then picking from the live catalog keeps the declared caps (Speech stays `tts` on `lfm3-audio`) and only fills the id/label; undeclared and text-kind drafts keep the catalog cap correction (llava → vision, whisper → stt)
