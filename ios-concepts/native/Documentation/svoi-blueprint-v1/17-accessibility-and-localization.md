# Accessibility and localization requirements

- Поддерживаются Dynamic Type и перенос строк без обрезки результата дела.
- Карточка дела имеет единый заголовок доступности: автор, результат, статус, срок и число новых обновлений.
- Статусы active и completed различаются текстом и символом, а не только цветом.
- Все изображения имеют подпись автора; доказательство получает редактируемое описание.
- Кнопки поддержки, подписки, воспроизведения и сохранения объявляют выбранное состояние.
- Голосовые обновления имеют расшифровку или подпись «Расшифровка недоступна».
- Минимальная область нажатия — 44 на 44 точки; порядок VoiceOver следует визуальному порядку.
- Reduce Motion отключает анимацию завершения и заменяет её статическим подтверждением.
- Контраст текста соответствует WCAG AA; акцент #0077FF не используется как единственный носитель смысла.
- CallKit, системные медиапикеры и разрешения сохраняют стандартное управление доступностью iOS.

- Dynamic Type must preserve hierarchy without horizontal escape.
- Every meaningful control has a stable accessibility label and identifier.
- VoiceOver order follows visual and task order.
- Russian copy is canonical; no forced uppercase or renderer-invented terminology.
