# Agent workflow

Run the single public command:

```sh
npm run generate -- native/specs/<product>.json
```

After the command succeeds, open every capture listed in
`native/artifacts/<product>/visual-review-request.json`. Judge each rubric axis
using visible evidence, combine product and UI findings into one bounded repair,
then rerun the same command and inspect the new captures.

Change the spec when the product model, content or navigation is wrong. Change a
shared native recipe when the composition is generically wrong. Do not patch the
generated app to hide a reusable pipeline defect.

Use no more than two repair iterations before returning to the product model.
Release requires a fresh independent human or vision-capable review with every
axis at 8.5 or above. The generating agent may guide iteration but cannot certify
its own release.
