# Testing and evidence plan

- Unit tests verify world invariants, reducers, documentation drift and deterministic compilers.
- XCUI executes every acceptance scenario and granted/denied capability branch.
- Every screen is captured in populated/default; canonical non-default states are captured where applicable.
- Geometry audit rejects content outside the viewport or behind persistent chrome.
- Pixel audit checks status-bar continuity and duplicate state captures.
- Independent product/UI review cannot pass without real pixels.
