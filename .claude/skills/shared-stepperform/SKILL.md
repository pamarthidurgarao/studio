---
name: shared-stepperform
description: Use whenever this app needs a multi-step wizard/onboarding flow — signup, checkout, a multi-page create/edit form, or anything split across "Step 1 of N" screens with Next/Back navigation. Reuse the existing shared StepperForm component (built on top of the shared DynamicForm) instead of hand-building step state and navigation.
---

# Shared StepperForm component

This app already has a configuration-driven multi-step form at
`src/components/shared/StepperForm/`. It's built **on top of** the shared `DynamicForm`
(`.claude/skills/shared-dynamicform/SKILL.md`) — same field engine, same field/section
config shape — plus step navigation, orientation, and per-step/final validation. Do not
hand-build a wizard with your own step-index `useState` and manually wired Next/Back
buttons — always go through this component.

Full docs: read `src/components/shared/StepperForm/README.md` first — it covers
orientation, linear vs free navigation, conditional steps, and validation timing.
`src/components/shared/DynamicForm/README.md` covers the field/section config shape itself
(identical for both components). `StepperForm.demo.tsx` is a complete 4-step signup wizard.

## Core shape (always three props, never more)

```tsx
import { StepperForm } from '../shared/StepperForm'; // adjust relative path
import type { StepperFormConfig, StepperFormActionEvent } from '../shared/StepperForm';

<StepperForm<Values> data={initialValues} config={config} onAction={handleAction} />
```

- `data` — initial values, shared across all steps.
- `config` — `{ steps, mode, orientation, linear, ... }`. Each `step.sections` uses the
  exact same `DynamicFormSection`/`DynamicFormField` shape as a plain `DynamicForm` — if you
  know how to write a `DynamicForm` config, you know how to write one step here.
- `onAction` — single callback: `field-change`, `step-change`, `submit` (only fires on
  Finish, validates every step), `cancel`, `file-select`.

## When building a new wizard for this app

1. Read `README.md` in `StepperForm/` first.
2. Split the form into `steps`, each with a `label` and one or more `sections` (written
   exactly like `DynamicForm` sections/fields — same field types, `hidden`/`disabled`/
   `required`, dependent dropdowns, `validators`, everything).
3. Pick `orientation: 'horizontal'` (steps across the top, default) or `'vertical'` (steps
   down the side) per the design — behavior is identical either way.
4. Leave `linear: true` (default) unless the design explicitly allows free jumping between
   steps before completing earlier ones.
5. Use `step.hidden: (values) => boolean` for steps that only apply conditionally (e.g. skip
   a billing step for a free plan) — don't render/hide steps yourself outside the config.

## If a feature seems missing

Field-level behavior (a field type, validation rule, view-mode formatting) lives in
`../DynamicForm/formEngine.tsx` and `../DynamicForm/types.ts` — extend it there, and both
`DynamicForm` and `StepperForm` pick it up automatically. Only add code in
`StepperForm.tsx`/`types.ts` for genuinely stepper-specific behavior (navigation, step
layout).
