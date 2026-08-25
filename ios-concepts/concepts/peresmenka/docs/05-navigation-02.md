## Information architecture and navigation

| Surface | Presentation | Parent | Entry | Exit | Guards | Back / dismiss |
|---|---|---|---|---|---|---|
| ads | sheet | settings | parent:settings | mutate:complete-ads<br>permission:tracking | none | dismiss:settings; interactive-or-action:settings |
