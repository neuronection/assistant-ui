---
'@neuronection/assistant-ui': minor
---

New `chat-tools-catalog` module: `ChatToolsCatalog` renders the catalog of
tools an assistant can use — searchable disclosure cards with tool name,
human title, scope chip, description, argument list (name/type/required/
description), example payload and response shape. Presentational and
controlled-external: data in via `tools`, fetching and the modal shell
stay app-side (study's `ToolsDialog` body and career's `/ai/tools`
surface, generalized).
