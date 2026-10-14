---
'@neuronection/assistant-ui': minor
---

ModelPicker labeled null option (`nullOption?: { label: string }`): the option list leads with the labeled null (inherit) entry — rendered "Inherits — {resolved default model}" by the app — and choosing it assigns `null` (plan 29 / ADR-0036, the Decision defaults card's inherit rows). The props are discriminated: with `nullOption` set, `onChange` receives `string | null`; without it the contract is unchanged.
