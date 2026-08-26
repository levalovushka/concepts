## Architecture and module boundaries

| Module | Responsibility | Owns |
|---|---|---|
| Product model | Владеет Образ, состояниями core loop и правилами доверия | native/apps/looks |
| Product development | Владеет Brief, кандидатами, receipt и зрелым Product Contract | concepts/looks/concept.json |
| UX specification | Владеет графом, состояниями, языком, сценариями и fixtures | concepts/looks/concept.json#ux |
| Runtime adapters | Владеет системными разрешениями и capability lifecycle без создания фиктивного успеха | native/Runtime |
| VK reference profile | Владеет только доказанной визуальной и интеракционной грамматикой референса | native/ReferenceProfiles/vk-ios |

**Boundaries**
- Product model не зависит от визуальных рецептов референса
- UX Specification описывает семантику, но не дублирует SwiftUI hierarchy
- Runtime adapter не может объявить продуктовый успех без наблюдаемого outcome
- Generated files не становятся источником продуктовой истины
