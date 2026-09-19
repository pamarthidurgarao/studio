# DynamicForm

Shared, configuration-driven form built on PrimeReact. Every field type, section, validation
rule, dependent dropdown, and add/edit/view mode is controlled through a plain config object.
Same pattern as [`DataTable`](../DataTable/README.md): three props, one callback.

## Import

```tsx
import { DynamicForm } from '../shared/DynamicForm'; // adjust relative depth
import type { DynamicFormConfig, DynamicFormActionEvent } from '../shared/DynamicForm';
```

## API shape

```tsx
<DynamicForm<Values>
  data={initialValues}    // Values — seeds the form; merged with each field's defaultValue
  config={config}          // DynamicFormConfig<Values> — pure declarative config, no callbacks
  onAction={handleAction}  // (event: DynamicFormActionEvent<Values>) => void — the ONLY callback
/>
```

The form manages its own field state internally (so it works standalone), but every change
and interaction is also reported through `onAction` as one discriminated union:

```tsx
function handleAction(event: DynamicFormActionEvent<Employee>) {
  switch (event.type) {
    case 'field-change':  // event.name, event.value, event.values (the full, updated object)
    case 'submit':        // event.values, event.isValid, event.errors
    case 'cancel':
    case 'file-select':   // event.name, event.files
  }
}
```

Sync `event.values` from `field-change`/`submit` back into your own state if you need the
form to be a controlled component from outside (see the demo).

## Minimal example

```tsx
const config: DynamicFormConfig<Employee> = {
  mode: 'add', // 'add' | 'edit' | 'view'
  sections: [
    {
      key: 'basic',
      title: 'Basic Info',
      fields: [
        { name: 'name', label: 'Name', type: 'text', required: true },
        { name: 'email', label: 'Email', type: 'email', required: true },
      ],
    },
  ],
};

<DynamicForm<Employee> data={initialValues} config={config} onAction={handleAction} />
```

## Modes: add / edit / view

`config.mode` controls the whole form:

- **`add` / `edit`** — normal editable form. `submitLabel` defaults to "Create"/"Save".
- **`view`** — every field renders as static, read-only text (no inputs), no required
  asterisks, and `showActions` defaults to `false` (no Submit/Cancel).

Field-level `disabled` still applies independently in `add`/`edit` mode if you want specific
fields read-only without switching the whole form to `view`.

## Field types

```ts
type FieldType =
  | 'text' | 'textarea' | 'number' | 'password' | 'email'
  | 'dropdown' | 'multiselect' | 'radio' | 'checkbox' | 'switch'
  | 'date' | 'file' | 'rating' | 'slider' | 'chips'
  | 'custom'; // bring your own renderer via `render`
```

```tsx
{
  name: 'department', label: 'Department', type: 'dropdown',
  options: [{ label: 'Engineering', value: 'eng' }],
},
{
  name: 'notes', label: 'Notes', type: 'custom',
  render: ({ value, setValue, disabled }) => (
    <MyRichTextEditor value={value} onChange={setValue} disabled={disabled} />
  ),
},
```

## Sections

```tsx
sections: [
  {
    key: 'location',
    title: 'Location',
    description: 'Where this person is based.',
    collapsible: true,
    collapsedByDefault: false,
    columns: 2,               // grid columns for this section's fields (defaults to config.columns)
    hidden: (values) => values.remote === true,
    fields: [ /* ... */ ],
  },
],
```

Fields lay out in a CSS grid with `columns` tracks. Use `field.colSpan` (a number, or
`'full'`) to make a field wider — e.g. a `textarea` or `email` field usually wants `'full'`.

## Field options — static, derived, or async/dependent

```tsx
{ name: 'role', label: 'Role', type: 'dropdown', options: ROLE_OPTIONS },              // static
{ name: 'city', label: 'City', type: 'dropdown',
  dependsOn: ['country'],                                                              // re-resolves when `country` changes
  options: (values) => CITY_OPTIONS_BY_COUNTRY[values.country] ?? [],                  // derived
  disabled: (values) => !values.country,
},
{ name: 'manager', label: 'Manager', type: 'dropdown',
  dependsOn: ['department'],
  options: async (values) => (await api.getManagers(values.department)).map(toOption), // async
},
```

`options` can return a plain array, or a `Promise` — the field shows a "Loading..."
placeholder and disables itself while resolving. `dependsOn` lists the field names whose
values should trigger a re-resolve; omit it for options that only need resolving once.

## Visibility & disabling — static or conditional

```tsx
{ name: 'managerName', label: 'Reports To', type: 'text',
  hidden: (values) => values.isManager,          // hidden fields are excluded from validation
  required: (values) => !values.isManager,       // required can be conditional too
},
{ name: 'ssn', label: 'SSN', type: 'text', disabled: (values) => values.mode === 'readonly' },
```

`hidden`/`disabled`/`required` all accept a plain boolean or a `(values) => boolean`
function evaluated against the current form state on every render.

## Validation

```tsx
{ name: 'password', label: 'Password', type: 'password', required: true,
  validate: (value, values) =>
    typeof value === 'string' && value.length < 8 ? 'Must be at least 8 characters.' : undefined,
},
```

`required` runs first (skips hidden fields), then `validate`. Validation runs on submit by
default; set `config.validateOnChange: true` to also validate as the user types/selects.
Errors render inline under each field and arrive in `onAction`'s `submit` event as
`{ [fieldName]: message }`.

## View-mode formatting

```tsx
{ name: 'salary', label: 'Salary', type: 'number',
  formatView: (value) => `$${Number(value).toLocaleString()}`,
},
```

Without `formatView`, view mode shows sensible defaults: Yes/No for checkbox/switch, the
matching option label for dropdown/radio/multiselect, a joined list for chips/multiselect,
a locale date string for date fields, and file names for file fields.

## Sizing

```tsx
size: 'small', // 'small' | 'medium' (default) | 'large'
```

Same convention as `DataTable` — sizes every input/control uniformly.

## Multi-step forms

For a wizard/stepper flow, use [`StepperForm`](../StepperForm/README.md) instead — it's
built on the same field engine as this component (`formEngine.tsx`), so steps are
configured with the exact same `sections`/`fields` shape documented above.

## Full example

See [`DynamicForm.demo.tsx`](./DynamicForm.demo.tsx) — a complete employee form exercising
every field type, sections (including collapsible + collapsed-by-default), a dependent
country → city dropdown, conditional required/hidden (`isManager` toggling `managerName`),
file upload, rating, slider, chips, a custom field renderer, and an Add/Edit/View mode
switcher. It isn't mounted anywhere in the app shell — the app's Pages landing screen
navigates "Form"-type pages into the (unrelated) Studio mock editor, not this demo — so
temporarily render `<DynamicFormDemo />` from a page while iterating on this component.

## Files

| File | Purpose |
|---|---|
| `DynamicForm.tsx` | The component (values/errors state, submit/cancel). |
| `formEngine.tsx` | The actual field-rendering/validation engine — shared with `StepperForm`. |
| `types.ts` | All config/field/event types — start here for the full surface. |
| `validators.ts` | Composable validation rules (`minLength`, `maxLength`, `min`, `max`, `pattern`, `email`, ...). |
| `dynamicForm.css` | Styling, including fixes for PrimeReact gaps (MultiSelect/Dropdown/Calendar size variants). |
| `DynamicForm.demo.tsx` | Live example wired to every feature. |
| `index.ts` | Public exports. |

## Extending

Follow the same shape as `DataTable`:
1. Add the option to `DynamicFormConfig`/`DynamicFormField` in `types.ts` (pure data).
2. New field types go in `formEngine.tsx`'s `FieldControl` switch (edit mode) and
   `ViewValue` (view mode) — changes there apply to `StepperForm` too automatically.
3. User-triggered behavior becomes a new `DynamicFormActionEvent` variant, not a new prop —
   `onAction` stays the single hook.
4. Add a CSS rule under a `.df-*` class in `dynamicForm.css` if PrimeReact's theme doesn't
   already size/style it — check `node_modules/primereact/resources/themes/<theme>/theme.css`
   first (MultiSelect and the paginator/dropdown trigger button are known gaps).
5. Add an example to `DynamicForm.demo.tsx`.
