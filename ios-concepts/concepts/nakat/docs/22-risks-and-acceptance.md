## Limitations, risks, and acceptance criteria

**Limitations**

- Market demand ещё не подтверждён
- Web screens являются migration evidence, а не native layout
- Медиа требуют отдельной проверки лицензии
- Physical device и VoiceOver остаются ручными воротами

**Risks**

- risk: Автошкола не поддерживает актуальное расписание; mitigation: Четырёхнедельный пилот с интервью завершивших и отказавшихся участников; killSignal: Более 20% слотов расходятся с фактическими за месяц
- risk: Набор разрешений окажется шире реальной ценности; mitigation: Проверять каждое разрешение через достижимый flow; killSignal: Разрешение нельзя защитить наблюдаемым исходом

**Assumptions still requiring evidence**

- claim: Связанный следующий шаг уменьшает незавершённость курса; risk: high; validation: Четырёхнедельный пилот с интервью завершивших и отказавшихся участников; status: needs-validation
- claim: Автошкола предоставляет актуальные билеты, разборы и расписание; risk: high; validation: Проверить supply и completion на пилотной когорте; status: needs-validation

**Acceptance criteria**

- Победитель воспроизводится из трёх кандидатов
- Все поверхности достижимы
- Каждое действие имеет исход
- Каждое разрешение имеет timing и fallback
- Critical flows покрыты сценариями
