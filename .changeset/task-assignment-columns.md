---
'@neuronection/assistant-ui': patch
---

`TaskAssignmentPicker` defaults rows use a column layout: the Primary and Fallback badges act as column headers with their pickers aligned beneath (fixed widths keep the columns stuck across rows); override rows render a single unbadged picker; the task title block can no longer be squeezed out by the action columns.
