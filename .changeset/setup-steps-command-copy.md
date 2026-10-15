---
'@neuronection/assistant-ui': minor
---

`ProviderSetupForm`: the setup checklist's copyable unit is now the `run:`
command tail of a step, not the whole prose line. Steps containing
"run: <command>" render the command as an inline code chip with its own copy
button (only the command lands in the clipboard, and `onCopyStep` now
receives the command); guidance-only steps render without any copy
affordance. Consumers mirroring copies through `onCopyStep` (Electron IPC)
should expect the command string.
