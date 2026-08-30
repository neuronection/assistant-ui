import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { extname, join, normalize } from 'node:path'

const root = process.argv[2] ?? 'build'
const port = Number(process.env.PORT ?? 61001)
const types = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
}

createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? '/', 'http://localhost')
    const clean = normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, '')
    const path = url.pathname.endsWith('/') ? join(root, clean, 'index.html') : join(root, clean)
    const data = await readFile(path)
    res.writeHead(200, { 'content-type': types[extname(path)] ?? 'application/octet-stream' })
    res.end(data)
  } catch {
    const data = await readFile(join(root, 'index.html'))
    res.writeHead(200, { 'content-type': 'text/html' })
    res.end(data)
  }
}).listen(port, () => {
  console.log(`serving ${root} on http://localhost:${port}`)
})
