---
'@neuronection/assistant-ui': patch
---

Fix the `./upload-dropzone` subpath export: the module shipped in the main barrel and was listed in the package `exports` map, but had no tsup entry, so `dist/upload-dropzone.*` was never built and subpath imports failed to resolve in consumer apps. Career-assistant imports it from the main barrel until the next release.
