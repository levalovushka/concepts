## Executable acceptance scenarios

| Scenario | Critical flow | Coverage | Given | When | Then |
|---|---|---|---|---|---|
| permission.voip.denied | permission:voip | permission-denial-fallback | surface:chat<br>fixture:fixture.today.call.permission-denied<br>permission-status:voip.not-determined | deny-permission:voip | state-visible:call.permission-denied<br>fallback-visible:voip |
| permission.audio.denied | permission:audio | permission-denial-fallback | surface:onway<br>fixture:fixture.today.background.permission-denied<br>permission-status:audio.not-determined | deny-permission:audio | state-visible:background.permission-denied<br>fallback-visible:audio |
