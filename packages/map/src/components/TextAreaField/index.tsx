import classNames from 'classnames'

interface TextAreaFieldProps {
  input: {
    name: string
    value: string
    onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void
  }
  label: string
  meta: {
    touched: boolean
    error?: string
    warning?: string
  }
  placeholder?: string
  required?: boolean
  rows?: number
  type: string
}

const TextAreaField = ({
  meta: { touched, error, warning },
  required = false,
  placeholder = '',
  rows = 2,
  type,
  ...props
}: TextAreaFieldProps) => (
  <div
    className={`form-input-${type} ${classNames({
      'form-input-error': (error || warning) && touched
    })}`}
  >
    <div>
      <label className={classNames({ required })} htmlFor={props.input.name}>
        {props.label}
      </label>

      <textarea placeholder={placeholder} rows={rows} {...props.input} />
    </div>
    {touched &&
      ((error && <p className='form-error'>{error}</p>) ||
        (warning && <p className='form-error'>{warning}</p>))}
  </div>
)

export default TextAreaField
