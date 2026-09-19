---
name: shared-dynamicform
description: Use whenever this app needs a data-entry/capture form — creating, editing, or viewing a record with any of text/number/dropdown/date/file/etc fields, sections, conditional visibility or requiredness, dependent dropdowns, or add/edit/view modes. Reuse the existing shared DynamicForm component instead of hand-building a form with individual PrimeReact inputs.
---

# Shared DynamicForm component

This app already has a configuration-driven form component at
`src/components/shared/DynamicForm/`. Do not hand-wire individual PrimeReact inputs
(`InputText`, `Dropdown`, etc.) with your own `useState` per field for a feature form —
always go through this component, the same way tables go through the shared `DataTable`
(`.claude/skills/shared-datatable/SKILL.md`).

Full docs: read `src/components/shared/DynamicForm/README.md` before wiring one up — it
covers every field type, section option, validation, dependent-dropdown, and mode with
examples. `types.ts` is the authoritative type reference. `DynamicForm.demo.tsx` is a
complete working example (all field types, sections, a dependent country→city dropdown,
conditional required/hidden, file upload, custom renderer, Add/Edit/View switcher).

## Core shape (always three props, never more)

```tsx
import { DynamicForm } from '../shared/DynamicForm'; // adjust relative path
import type { DynamicFormConfig, DynamicFormActionEvent } from '../shared/DynamicForm';

<DynamicForm<Values> data={initialValues} config={config} onAction={handleAction} />
```

- `data` — the initial/current values object.
- `config` — pure declarative object: `mode` (`'add' | 'edit' | 'view'`), `sections` (each
  with `fields`). **Never** put an `onClick`/callback inside `config` — these types don't
  have one and it won't compile.
- `onAction` — the single callback. `field-change`, `submit`, `cancel`, `file-select` all
  arrive here as one discriminated union. Switch on `event.type`.

## When building a new form for this app

1. Read `README.md` in that folder first — don't guess the config shape.
2. Pick the field `type` per field (`text`, `number`, `dropdown`, `date`, `file`, `switch`,
   `chips`, etc. — see the `FieldType` union in `types.ts`); use `type: 'custom'` with a
   `render` function only for something none of the built-in types cover.
3. Group related fields into `sections` (with `title`, optionally `collapsible`).
4. Use `hidden`/`disabled`/`required` as plain booleans or `(values) => boolean` functions
   for conditional form logic — don't build separate show/hide state outside the config.
5. For dependent dropdowns (e.g. country → city), use `options: (values) => ...` plus
   `dependsOn: ['country']` — the component re-resolves automatically, including async
   (`Promise`-returning) resolvers.
6. Set `config.mode` to `'view'` for a read-only detail screen instead of building a
   separate display component — it reuses the same config and renders static text.
7. Use `config.size` instead of styling individual inputs.
8. If the form should be a multi-step wizard (Next/Back, "Step X of N") instead of one long
   form, use `StepperForm` instead (`.claude/skills/shared-stepperform/SKILL.md`) — it takes
   the exact same section/field config, just grouped into `steps`.

## If a feature seems missing

Check `types.ts` first — conditional required/hidden/disabled, per-field validation,
view-mode value formatting, and file uploads are all already supported. If something is
genuinely missing, extend the component (see the "Extending" section at the bottom of the
README) rather than working around it in a feature file.
