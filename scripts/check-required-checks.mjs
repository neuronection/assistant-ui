#!/usr/bin/env node
/**
 * Guards the required-status-check contexts against workflow drift.
 *
 * The ruleset that protects `main` lives in repository settings, so nothing in
 * the tree can read it. `.github/required-checks.json` mirrors it; this script
 * proves every context in that mirror still matches a job the workflows
 * actually report, including matrix-generated names such as
 * `smoke (react18-tailwind3)`.
 *
 * Why it exists: a renamed job — or a renamed matrix row — makes the required
 * context never report, which silently blocks every pull request with the same
 * symptom the mirror is meant to prevent (plan 103, W2).
 */
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const workflowsDir = join(root, '.github', 'workflows')
const mirrorFile = join(root, '.github', 'required-checks.json')

const MATRIX_PLACEHOLDER = /\$\{\{\s*matrix\.([A-Za-z0-9_-]+)\s*\}\}/g

function expandContexts(name, matrixValues) {
  const keys = [...name.matchAll(MATRIX_PLACEHOLDER)].map((m) => m[1])
  if (keys.length === 0) return [name]
  if (keys.length > 1) {
    throw new Error(
      `Job display name "${name}" uses more than one matrix placeholder; ` +
        'extend scripts/check-required-checks.mjs before relying on it.',
    )
  }
  const values = matrixValues[keys[0]]
  if (!values || values.size === 0) {
    throw new Error(
      `Job display name "${name}" expands a matrix.${keys[0]} placeholder but no matrix values were found.`,
    )
  }
  return [...values].map((value) => name.replace(MATRIX_PLACEHOLDER, value))
}

function jobContexts(source) {
  const lines = source.split('\n')
  const jobs = []
  let inJobs = false
  let job = null
  let inMatrixInclude = false

  for (const line of lines) {
    if (/^jobs:\s*$/.test(line)) {
      inJobs = true
      continue
    }
    if (!inJobs) continue
    if (/^\S/.test(line)) {
      inJobs = false
      job = null
      continue
    }
    const jobKey = /^ {2}([A-Za-z0-9_-]+):\s*$/.exec(line)
    if (jobKey) {
      job = { id: jobKey[1], name: null, matrix: {} }
      jobs.push(job)
      inMatrixInclude = false
      continue
    }
    if (!job) continue

    const displayName = /^ {4}name:\s*(.+?)\s*$/.exec(line)
    if (displayName) {
      job.name = displayName[1].replace(/^['"]|['"]$/g, '')
      continue
    }

    if (/^ {8}include:\s*$/.test(line)) {
      inMatrixInclude = true
      continue
    }
    if (inMatrixInclude) {
      const entry = /^ {8,}-?\s*([A-Za-z0-9_-]+):\s*(.+?)\s*$/.exec(line)
      if (entry) {
        const [, key, value] = entry
        ;(job.matrix[key] ??= new Set()).add(value.replace(/^['"]|['"]$/g, ''))
        continue
      }
      if (/^ {1,7}\S/.test(line)) inMatrixInclude = false
    }
  }

  return jobs.flatMap((entry) => {
    const contexts = entry.name ? expandContexts(entry.name, entry.matrix) : [entry.id]
    return contexts.map((context) => ({ context, jobId: entry.id }))
  })
}

const mirror = JSON.parse(readFileSync(mirrorFile, 'utf8'))
const required = new Set(mirror.contexts)

const reported = new Map()
for (const file of readdirSync(workflowsDir).filter((f) => /\.ya?ml$/.test(f))) {
  const source = readFileSync(join(workflowsDir, file), 'utf8')
  for (const { context, jobId } of jobContexts(source)) {
    if (reported.has(context)) {
      console.error(
        `✗ context "${context}" is produced by two jobs ` +
          `(${reported.get(context)} in another workflow and ${jobId} in ${file}). ` +
          'A required check needs exactly one producer.',
      )
      process.exitCode = 1
      continue
    }
    reported.set(context, `${jobId} in ${file}`)
  }
}

const missing = [...required].filter((context) => !reported.has(context))
if (missing.length > 0) {
  console.error('✗ required checks with no matching workflow job display name:')
  for (const context of missing) {
    console.error(`  · "${context}"`)
  }
  console.error(
    '\nEvery context in .github/required-checks.json must be the job id or the\n' +
      'rendered job display name of a workflow that runs on every pull request.',
  )
  process.exitCode = 1
} else {
  console.log(
    `required-check mirror OK: ${required.size} contexts all resolve to workflow jobs`,
  )
}
