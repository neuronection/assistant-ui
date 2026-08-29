# Security Policy

## Supported versions

Only the latest stable release line receives security fixes.

## Reporting a vulnerability

Open a security advisory via GitHub's private vulnerability reporting on this
repository, or email the maintainers. Please do not open public issues for
suspected vulnerabilities.

## Scope notes

- This library is **presentational only**: it never handles API keys, tokens,
  or network requests. Settings-style components expose write-only inputs;
  secrets never transit the library.
- Supply chain: releases are published from CI with npm provenance
  attestation; no laptop publishes.
