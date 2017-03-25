import React from 'react'
import classNames from 'classnames'

const InputField = ({ meta: { touched, error, warning }, ...props }) => (
  <div>
    <label
      className={classNames({ required: props.required })}
      htmlFor={props.input.name}
    >
      {props.label}
    </label>
    <div>
      <input
        placeholder={props.placeholder}
        type={props.type}
        {...props.input}
      />
      {touched && ((error && <span>{error}</span>) || (warning && <span>{warning}</span>))}
    </div>
  </div>
)

InputField.propTypes = {
  input: React.PropTypes.shape({
    name: React.PropTypes.string,
  }).isRequired,
  label: React.PropTypes.string.isRequired,
  type: React.PropTypes.string.isRequired,
  meta: React.PropTypes.shape({
    touched: React.PropTypes.bool.isRequired,
    error: React.PropTypes.arrayOf(React.PropTypes.string),
    warning: React.PropTypes.string,
  }).isRequired,
  placeholder: React.PropTypes.string,
  required: React.PropTypes.bool,
}

InputField.defaultProps = {
  required: false,
  placeholder: '',
}

export default InputField
