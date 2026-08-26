## Limitations, risks, and acceptance criteria

**Limitations**

- Market demand ещё не подтверждён
- Web screens являются migration evidence, а не native layout
- Медиа требуют отдельной проверки лицензии
- Physical device и VoiceOver остаются ручными воротами

**Risks**

- risk: Участники не переходят от просмотра к завершению задачи; mitigation: Четырёхнедельный пилот с интервью завершивших и отказавшихся участников; killSignal: Менее 15% активированных участников завершают исход после четырёх недель
- risk: Набор разрешений окажется шире реальной ценности; mitigation: Проверять каждое разрешение через достижимый flow; killSignal: Разрешение нельзя защитить наблюдаемым исходом

**Assumptions still requiring evidence**

- claim: Явная совместимость повышает долю безопасно завершённых и повторных прогулок; risk: high; validation: Четырёхнедельный пилот с интервью завершивших и отказавшихся участников; status: needs-validation
- claim: Для «Совместимая прогулка» достаточно повторяемого предложения и ответов в начальной когорте; risk: high; validation: Проверить supply и completion на пилотной когорте; status: needs-validation

**Acceptance criteria**

- Победитель воспроизводится из трёх кандидатов
- Все поверхности достижимы
- Каждое действие имеет исход
- Каждое разрешение имеет timing и fallback
- Critical flows покрыты сценариями
