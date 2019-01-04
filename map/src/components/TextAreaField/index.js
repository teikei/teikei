import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

const TextAreaField = ({
  meta: { touched, error, warning },
  required,
  input,
  label,
  placeholder,
  rows
}) => (
  <div>
    <label className={classNames({ required })} htmlFor={input.name}>
      {label}
    </label>
    <div>
      <textarea placeholder={placeholder} rows={rows} {...input} />
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
