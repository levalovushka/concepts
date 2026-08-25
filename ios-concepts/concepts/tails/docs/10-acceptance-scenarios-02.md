## Executable acceptance scenarios

| Scenario | Critical flow | Coverage | Given | When | Then |
|---|---|---|---|---|---|
| permission.shareext.denied | permission:shareext | permission-denial-fallback | surface:settings<br>fixture:fixture.tails.shareext.permission-denied<br>permission-status:shareext.not-determined | deny-permission:shareext | state-visible:shareext.permission-denied<br>fallback-visible:shareext |
| permission.hotspot.denied | permission:hotspot | permission-denial-fallback | surface:netqr<br>fixture:fixture.tails.netqr.permission-denied<br>permission-status:hotspot.not-determined | deny-permission:hotspot | state-visible:netqr.permission-denied<br>fallback-visible:hotspot |
