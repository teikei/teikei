import React, { PropTypes } from 'react'
import classNames from 'classnames'

const TextAreaField = ({ meta: { touched, error, warning }, ...props }) => (
  <div>
    <label
      className={classNames({ required: props.required })}
      htmlFor={props.input.name}
    >
      {props.label}
    </label>
    <div>
      <textarea
        placeholder={props.placeholder}
        rows={props.rows}
        {...props.input}
      />
      {touched &&
        ((error && <span>{error}</span>) ||
          (warning && <span>{warning}</span>))}
    </div>
  </div>
)

TextAreaField.propTypes = {
  input: PropTypes.shape({
    name: PropTypes.string
  }).isRequired,
  label: PropTypes.string.isRequired,
  meta: PropTypes.shape({
    touched: PropTypes.bool.isRequired,
    error: PropTypes.string,
    warning: PropTypes.string
  }).isRequired,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  rows: PropTypes.string
}

TextAreaField.defaultProps = {
  required: false,
  placeholder: '',
  rows: ''
}

export default TextAreaField
