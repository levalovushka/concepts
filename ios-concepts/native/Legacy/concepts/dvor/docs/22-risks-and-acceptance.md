## Limitations, risks, and acceptance criteria

**Limitations**

- Курируемый отбор фиксирует продуктовую связность, но не заменяет генерацию реальной моделью для нового brief
- Нет подтверждённого исследования спроса, supply и retention
- Удалённые provider contracts требуют отдельного evidence intake
- Физическое устройство и VoiceOver остаются human gates

**Risks**

- risk: Реального supply для Дело дома недостаточно после seed-набора; mitigation: Проверить ограниченный cohort и вклад после получения ценности до масштабирования; killSignal: После четырёх недель активная cohort не создаёт минимально достаточное число релевантных единиц
- risk: Знакомая VK-модель скрывает собственный продуктовый outcome за пассивными реакциями; mitigation: Сохранять primary action и статус outcome заметнее декоративной engagement-механики; killSignal: Большинство активных пользователей ограничивается реакциями и не завершает core loop

**Assumptions still requiring evidence**

- claim: Для соседской сети доверие начинается не с общих интересов, а с доказуемой связи с одним адресом и общей инфраструктурой.; risk: high; validation: Problem interviews и наблюдение текущего поведения целевой аудитории; status: needs-validation
- claim: Жильцы создают дела из реальных событий, а регулярные сроки и статусы инфраструктуры пополняют полезный контекст; risk: high; validation: Четырёхнедельный supply pilot с разбором причин создания и отказа; status: needs-validation
- claim: Стоимость завершённого дела и поддержки активного House ниже согласованной операционной экономии; risk: medium; validation: Посчитать реальные операционные издержки после подтверждения core loop; status: needs-validation

**Acceptance criteria**

- Embedded receipt и Product Contract воспроизводятся из Brief и трёх кандидатов
- Все maturity gates победителя проходят с floor не ниже 3/4
- Каждый action имеет outcome, а каждое разрешение — timing и denied fallback
- Все критические flows покрыты happy, failure, offline и persistence scenarios
- Каждое снимаемое состояние имеет deterministic fixture
