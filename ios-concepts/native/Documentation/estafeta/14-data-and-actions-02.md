# Data, actions and persistence · 2

The local world model is the source of truth for reducers and fixture storage. Effect type and target are executable compiler input, while outcome is acceptance copy.

| Action | Actor | Entity | Intent | Effect | Effect target | Outcome | Persistence |
|---|---|---|---|---|---|---|---|
| capability_audio | — | chapter | — | system | capability_audio | Слушать продолжения: результат сохранён в текущей эстафете и остаётся видимым пользователю | local-model |
| capability_voip | — | person | — | system | capability_voip | Позвонить участнику: результат сохранён в текущей эстафете и остаётся видимым пользователю | local-model |
| capability_calendar | — | handoff | — | system | capability_calendar | Запланировать ход: результат сохранён в текущей эстафете и остаётся видимым пользователю | local-model |
| capability_associateddomains | — | relay | — | system | capability_associateddomains | Открывать ссылки на эстафеты: результат сохранён в текущей эстафете и остаётся видимым пользователю | local-model |
| capability_hotspot | — | relay | — | system | capability_hotspot | Подключиться к встрече: результат сохранён в текущей эстафете и остаётся видимым пользователю | local-model |
