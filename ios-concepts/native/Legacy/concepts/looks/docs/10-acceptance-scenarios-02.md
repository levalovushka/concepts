## Executable acceptance scenarios

| Scenario | Critical flow | Coverage | Given | When | Then |
|---|---|---|---|---|---|
| permission.hotspot.denied | permission:hotspot | permission-denial-fallback | surface:netqr<br>fixture:fixture.looks.netqr.permission-denied<br>permission-status:hotspot.not-determined | deny-permission:hotspot | state-visible:netqr.permission-denied<br>fallback-visible:hotspot |
