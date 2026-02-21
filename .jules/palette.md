## 2025-05-22 - [Accessibility: Keyboard Navigation for Action Spans]
**Learning:** In a SPA where navigation or state changes are triggered by `onClick` on `<span>` elements, the application becomes inaccessible to keyboard users. These elements do not appear in the tab order.
**Action:** Always refactor clickable `<span>` elements to `<button type="button">` with `background: none` and `border: none` to preserve the visual design while enabling keyboard focus and interaction.

## 2025-05-22 - [Design: Thematic Form Labels]
**Learning:** Accessibility requirements like form labels can be seamlessly integrated into a highly stylized "cyber/military" aesthetic by using thematic prefixes like `//` to mimic code comments or terminal outputs.
**Action:** When adding labels to themed interfaces, adapt the label text and styling to match the established visual language while maintaining semantic correctness.
