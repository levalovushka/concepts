## Architecture and module boundaries

| Module | Responsibility | Owns |
|---|---|---|
| Product domain | Владеет сущностями и состояниями Совместимая прогулка | native/apps/tails |
| Native runtime | Владеет системными разрешениями и lifecycle | native/Runtime |
| Visual language | Владеет семантической визуальной грамматикой | native/ReferenceProfiles/vk-ios |

**Boundaries**
- Продуктовое состояние не живёт в визуальных примитивах
- Разрешения доступны только через причинное действие
- Web evidence не входит в native build graph
