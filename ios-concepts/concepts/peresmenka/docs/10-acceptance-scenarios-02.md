## Executable acceptance scenarios

| Scenario | Critical flow | Coverage | Given | When | Then |
|---|---|---|---|---|---|
| permission.tracking.denied | permission:tracking | permission-denial-fallback | surface:ads<br>fixture:fixture.peresmenka.menu.permission-denied<br>permission-status:tracking.not-determined | deny-permission:tracking | state-visible:menu.permission-denied<br>fallback-visible:tracking |
