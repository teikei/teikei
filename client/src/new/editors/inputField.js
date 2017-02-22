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
      <input {...props.input} type={props.type} />
      {touched && ((error && <span>{error}</span>) || (warning && <span>{warning}</span>))}
    </div>
  </div>
)

inputField.propTypes = {
  input: React.PropTypes.shape({
    name: React.PropTypes.string,
  }).isRequired,
  label: React.PropTypes.string.isRequired,
  type: React.PropTypes.string.isRequired,
  meta: React.PropTypes.shape({
    touched: React.PropTypes.bool.isRequired,
    error: React.PropTypes.string,
    warning: React.PropTypes.string,
  }).isRequired,
  required: React.PropTypes.bool,
}

inputField.defaultProps = {
  required: false,
}

export default inputField
