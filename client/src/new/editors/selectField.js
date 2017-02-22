import React from 'react'
import Select from 'react-select'
import 'react-select/dist/react-select.css'

const selectField = (props) => {
  const { touched, error, warning } = props.meta

  return (
    <div className="form-control">
      <label className="required" htmlFor={props.input.name}>
        {props.label}
      </label>
      <Select
        options={props.options}
        valueKey={props.valueKey}
        labelKey={props.labelKey}
        multi={props.multi}
        className="form-select"
      />
      {touched && ((error && <span>{error}</span>) || (warning && <span>{warning}</span>))}
    </div>
  )
}

selectField.propTypes = {
  input: React.PropTypes.shape({
    name: React.PropTypes.string,
  }).isRequired,
  label: React.PropTypes.string.isRequired,
  multi: React.PropTypes.bool.isRequired,
  valueKey: React.PropTypes.string.isRequired,
  labelKey: React.PropTypes.string.isRequired,
  options: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
  meta: React.PropTypes.shape({
    touched: React.PropTypes.bool.isRequired,
    error: React.PropTypes.string,
    warning: React.PropTypes.string,
  }).isRequired,
}

export default selectField
