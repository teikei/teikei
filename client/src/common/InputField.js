import React, { PropTypes } from 'react'
import classNames from 'classnames'

const InputField = ({ meta: { touched, error, warning }, ...props }) => (
  <div className={`form-input-${props.type}`}>
    <label
      className={classNames({ required: props.required })}
      htmlFor={props.input.name}
    >
      {props.label}
    </label>
    <input
      placeholder={props.placeholder}
      type={props.type}
      {...props.input}
    />
    {touched && ((error && <p className="form-explanation">{error}</p>)
      || (warning && <p className="form-explanation">{warning}</p>))}
  </div>
)

InputField.propTypes = {
  input: PropTypes.shape({
    name: PropTypes.string,
  }).isRequired,
  label: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  meta: PropTypes.shape({
    touched: PropTypes.bool.isRequired,
    error: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.string),
      PropTypes.string,
    ]),
    warning: PropTypes.string,
  }).isRequired,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
}

InputField.defaultProps = {
  required: false,
  placeholder: '',
}

export default InputField
