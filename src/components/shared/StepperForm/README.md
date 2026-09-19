# StepperForm

A multi-step wizard built **on top of** [`DynamicForm`](../DynamicForm/README.md) — it reuses
the exact same field engine (`formEngine.tsx`: field rendering, option resolution,
validation) so a step's `sections`/`fields` are configured identically to a plain
`DynamicForm`. Same overall pattern: three props, one callback, pure config.

## Import

```tsx
import { StepperForm } from '../shared/StepperForm'; // adjust relative depth
import type { StepperFormConfig, StepperFormActionEvent } from '../shared/StepperForm';
```

## API shape

```tsx
<StepperForm<Values>
  data={initialValues}
  config={config}          // StepperFormConfig<Values>
  onAction={handleAction}  // (event: StepperFormActionEvent<Values>) => void
/>
```

```tsx
function handleAction(event: StepperFormActionEvent<Signup>) {
  switch (event.type) {
    case 'field-change': // event.name, event.value, event.values
    case 'step-change':  // event.fromIndex, event.toIndex, event.values
    case 'submit':        // event.values, event.isValid, event.errors (only on Finish)
    case 'cancel':
    case 'file-select':
  }
}
```

## Minimal example

```tsx
const config: StepperFormConfig<Signup> = {
  mode: 'add',
  orientation: 'horizontal', // or 'vertical'
  steps: [
    {
      key: 'account',
      label: 'Account',
      sections: [
        {
          key: 'account-basic',
          fields: [
            { name: 'email', label: 'Email', type: 'email', required: true },
            { name: 'password', label: 'Password', type: 'password', required: true },
          ],
        },
      ],
    },
    {
      key: 'company',
      label: 'Company',
      sections: [{ key: 'company-info', fields: [/* ... */] }],
    },
  ],
};

<StepperForm<Signup> data={initialValues} config={config} onAction={handleAction} />
```

Each `step.sections` uses exactly the same `DynamicFormSection`/`DynamicFormField` shape
documented in the [DynamicForm README](../DynamicForm/README.md) — field types, `hidden`,
`disabled`, `required`, `options` (including dependent/async dropdowns), `validators`,
`colSpan`, custom `render`, everything. If you already know how to configure a `DynamicForm`,
you already know how to configure a step.

## Orientation

```tsx
orientation: 'horizontal', // steps laid out in a row above the content (default)
orientation: 'vertical',   // steps laid out in a column beside the content
```

Purely a layout toggle — behavior (validation, navigation, linear gating) is identical in
both.

## Navigation & validation

- **Next** validates only the *current* step's fields (via the same engine `DynamicForm`
  uses) and blocks advancing until they pass — errors render inline exactly like in
  `DynamicForm`.
- **Back** never validates — you can always go back.
- **Finish** (shown on the last step) validates **every** visible field across **every**
  visible step. If anything fails, the stepper jumps to the first step containing an error
  so the user sees it immediately, and `onAction` fires `submit` with `isValid: false`.
- `config.linear` (default `true`): the step nav only lets you click back to a step you've
  already visited — you can't skip ahead by clicking. Set `false` to allow free jumping
  between steps by clicking the nav (validation on Next/Finish still applies).
- `mode: 'view'` renders every field read-only (no inputs, no Next/Back/Finish/Cancel) and
  lets you click freely between steps to review — no validation runs.

## Conditional steps

```tsx
{
  key: 'billing',
  label: 'Billing',
  hidden: (values) => values.plan === 'free',
  sections: [/* ... */],
},
```

Hidden steps are skipped entirely — not shown in the nav, not validated, not counted toward
"last step".

## Sizing

```tsx
size: 'small', // 'small' | 'medium' (default) | 'large'
```

Same convention as `DataTable`/`DynamicForm` — sizes every field and button uniformly.

## Full example

See [`StepperForm.demo.tsx`](./StepperForm.demo.tsx) — a 4-step signup wizard (Account →
Company → Plan → Review) with a horizontal/vertical toggle, required fields, a password
`minLength` validator, dropdown/radio/multiselect, and a checkbox with custom `validate`.
It isn't mounted anywhere in the app shell — the app's Pages landing screen navigates
"Stepper"-type pages into the (unrelated) Studio mock editor, not this demo — so
temporarily render `<StepperFormDemo />` from a page while iterating on this component.

## Files

| File | Purpose |
|---|---|
| `StepperForm.tsx` | The component — step navigation, per-step and final validation. |
| `types.ts` | Config/step/event types. |
| `stepperForm.css` | Stepper nav + layout styling (imports alongside `../DynamicForm/dynamicForm.css` for field styling). |
| `StepperForm.demo.tsx` | Live example. |
| `index.ts` | Public exports. |

Field rendering itself lives in [`../DynamicForm/formEngine.tsx`](../DynamicForm/formEngine.tsx)
— shared with `DynamicForm` so both stay visually and behaviorally identical. Don't
duplicate field-rendering logic here; if a field type or behavior needs changing, change it
in `formEngine.tsx` and both components pick it up.

## Extending

- New per-field behavior (a field type, validation, view-mode formatting) → change
  `../DynamicForm/formEngine.tsx` and/or `../DynamicForm/types.ts`. Both `DynamicForm` and
  `StepperForm` get it automatically.
- New stepper-specific behavior (nav style, a new navigation event) → `types.ts` +
  `StepperForm.tsx` here, following the same "config is data, `onAction` is the only
  callback" rule as the rest of these shared components.
