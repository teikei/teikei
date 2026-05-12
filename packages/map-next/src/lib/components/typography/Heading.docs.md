# Heading

## Purpose

Semantic heading component for reusable page and panel headings.

## Use When

Use when a shared component, layout helper, or route needs a heading that follows the application typography scale and primary color.

## Avoid When

Avoid for purely visual text that is not a document heading. Use `Paragraph` or local text markup for supporting copy.

## Props

- `level`: semantic heading level from `1` to `6`.
- Standard heading HTML attributes are forwarded.

## Variants

The visual variant is derived from `level`.

## Examples

```svelte
<Heading level={2}>Nearby farms</Heading>
```
