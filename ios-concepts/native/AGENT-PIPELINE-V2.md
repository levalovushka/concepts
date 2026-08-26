# Agent loop for Native Pipeline v2

The public workflow has one input and one command:

```sh
npm run native:v2 -- native/ConceptSpecs/<product>.json
```

The command is not the end of the agent task. It builds the SwiftUI app, runs
XCUI, captures every declared state and writes
`native/artifacts/<product>/visual-review-request.json`.

The agent must then:

1. Open and visually inspect every fresh capture listed in the packet.
2. Judge every rubric axis and record concrete visible evidence.
3. Convert blocker and major findings into one bounded repair brief.
4. Change the `ConceptSpec` when the product or content is wrong; change a
   reusable native recipe when the composition is generically wrong.
5. Re-run the same command and inspect the new captures. At most two repair
   iterations are allowed before the product model must be reconsidered.

Media generation is optional. When no supplied or generated image exists, use
a deterministic gray placeholder with a semantic label. A placeholder is not
an excuse to omit media hierarchy from a media-led product.

Release requires a fresh independent human or vision-capable review with every
axis at 8.5 or above. Structural checks and the generating agent's own review
can guide iteration but cannot certify their own release.

The HTML concept pattern catalog in `native/lib/html-concept-patterns.mjs` is a
design input, not web markup to port. Reuse its product compositions through
native SwiftUI recipes and keep platform chrome, navigation and permissions
native.
