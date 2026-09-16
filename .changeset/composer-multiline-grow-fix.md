---
'@neuronection/assistant-ui': patch
---

ChatComposer: fix multiline auto-grow clipping the first line. The grow
height now adds a 1px slack over the (browser-rounded-down) scrollHeight
so fractional line-heights (e.g. `text-sm leading-relaxed` = 22.75px)
no longer leave the box short and let the caret scroll the first line
out of a hidden-overflow textarea; an under-cap box also pins
`scrollTop` to 0. The JS cap now mirrors the CSS box — a `max-h-*`
class on the textarea wins over `maxRows * 22`, so the two could never
disagree and hide lines silently.
