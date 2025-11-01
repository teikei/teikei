import classNames from 'classnames'
import type { ChangeEvent } from 'react'

interface InputFieldProps {
  input: {
    name: string
    value: string
    onChange: (event: ChangeEvent<HTMLInputElement>) => void
  }
  label: string
  type: string
  meta: {
    touched: boolean
    error?: string | string[]
    warning?: string
  }
  placeholder?: string
  required?: boolean
}

const InputField = ({
  required = false,
  placeholder = '',
  meta: { touched, error, warning },
  ...props
}: InputFieldProps) => (
  <div
    className={`form-input-${props.type} ${classNames({
      'form-input-error': (error || warning) && touched
    })}`}
  >
    <div>
      <label className={classNames({ required })} htmlFor={props.input.name}>
        {props.label}
      </label>
      <input placeholder={placeholder} type={props.type} {...props.input} />
    </div>
    {touched &&
      ((error && <p className='form-error'>{error}</p>) ||
        (warning && <p className='form-error'>{warning}</p>))}
  </div>
)

export default InputField
