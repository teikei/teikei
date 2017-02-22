import React from 'react'
import classNames from 'classnames'

const inputField = ({ meta: { touched, error, warning }, ...props }) => (
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
      {touched && ((error && <span>{error}</span>) || (warning && <span>{warning}</span>))}
    </div>
  </div>
)

inputField.propTypes = {
  input: React.PropTypes.shape({
    name: React.PropTypes.string,
  }).isRequired,
  label: React.PropTypes.string.isRequired,
  meta: React.PropTypes.shape({
    touched: React.PropTypes.bool.isRequired,
    error: React.PropTypes.string,
    warning: React.PropTypes.string,
  }).isRequired,
  placeholder: React.PropTypes.string,
  required: React.PropTypes.bool,
  rows: React.PropTypes.string,
}

inputField.defaultProps = {
  required: false,
  placeholder: '',
  rows: '',
}

export default inputField
