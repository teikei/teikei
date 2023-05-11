import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

const InputField = ({ meta: { touched, error, warning }, ...props }) => (
  <div
    className={`form-input-${props.type} ${classNames({
      'form-input-error': (error || warning) && touched,
    })}`}
  >
    <div>
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
    </div>
    {touched &&
      ((error && <p className="form-error">{error}</p>) ||
        (warning && <p className="form-error">{warning}</p>))}
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
