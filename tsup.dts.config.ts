import { defineConfig } from 'tsup'

import { dtsShards } from './tsup.config'

const shard = dtsShards[Number(process.env.DTS_SHARD ?? 0)]

if (!shard || Object.keys(shard).length === 0) {
  throw new Error(
    `DTS_SHARD=${process.env.DTS_SHARD} selects no entries (shards: ${dtsShards.length})`,
  )
}

export default defineConfig({
  entry: shard,
  format: ['esm'],
  splitting: true,
  sourcemap: false,
  clean: false,
  dts: { only: true },
})
