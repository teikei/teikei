import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

const TextAreaField = ({ meta: { touched, error, warning }, ...props }) => (
  <div
    className={`form-input-${props.type} ${classNames({
      'form-input-error': (error || warning) && touched
    })}`}
  >
    <div>
      <label
        className={classNames({ required: props.required })}
        htmlFor={props.input.name}
      >
        {props.label}
      </label>

      <textarea
        placeholder={props.placeholder}
        rows={props.rows}
        {...props.input}
      />
    </div>
    {touched &&
      ((error && <p className='form-error'>{error}</p>) ||
        (warning && <p className='form-error'>{warning}</p>))}
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
