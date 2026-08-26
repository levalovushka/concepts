## Information architecture and navigation

| Surface | Presentation | Parent | Entry | Exit | Guards | Back / dismiss |
|---|---|---|---|---|---|---|
| shareext | sheet | settings | parent:settings<br>permission:settings.shareext | mutate:save-shared-draft | capability.shareext.requested | dismiss:settings; interactive-or-action:settings |
