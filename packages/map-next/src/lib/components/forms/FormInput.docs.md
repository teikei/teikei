# FormInput

## Purpose

Standard text input field with label and validation message wiring.

## Use When

Use in forms backed by validation where the field needs the standard label, input, invalid state, and error message layout.

## Avoid When

Avoid for compound inputs, search boxes with inline actions, or non-text controls. Create a dedicated shared form component for those cases.

## Props

- `id`: input id and label target.
- `label`: visible field label.
- `type`: HTML input type, defaults to `text`.
- `value`: bindable string value.
- `error`: translated or translatable validation error.
- `labelExtra`: optional snippet rendered next to the label.

## Variants

No visual variants yet.

## Examples

```svelte
<FormInput id="email" label="Email" type="email" bind:value={email} error={emailError} />
```
