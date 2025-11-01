import type { ChangeEvent } from 'react'

interface CheckboxGroupProps {
  input: {
    name: string
    value: string[]
    onChange: (value: string[]) => void
  }
  options: { name: string; label: string }[]
  groupLabel: string
  meta: {
    touched: boolean
    error?: string[]
    warning?: string
  }
}

const CheckboxGroup = ({
  meta: { touched, error, warning },
  input,
  groupLabel,
  options
}: CheckboxGroupProps) => (
  <div>
    <label htmlFor={groupLabel}>{groupLabel}</label>
    <ul id={groupLabel} className='form-checkbox-group'>
      {options.map(({ name, label }, index) => (
        <li key={`checkbox_${name}`}>
          <label key={`label_${name}`} htmlFor={`${name}[${index}]`}>
            <input
              type='checkbox'
              name={`${name}[${index}]`}
              id={`${name}[${index}]`}
              value={name}
              checked={input.value.indexOf(name) !== -1}
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                const newValue = [...input.value]
                if (event.target.checked) {
                  newValue.push(name)
                } else {
                  newValue.splice(newValue.indexOf(name), 1)
                }
                return input.onChange(newValue)
              }}
            />
            {label}
          </label>
        </li>
      ))}
      {touched &&
        ((error && <span>{error.join(', ')}</span>) ||
          (warning && <span>{warning}</span>))}
    </ul>
  </div>
)

export default CheckboxGroup
