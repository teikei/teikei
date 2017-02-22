import React from 'react'
import Select from 'react-select'
import 'react-select/dist/react-select.css'
import classNames from 'classnames'

const selectField = props => (
  <div className="form-control">
    <label
      className={classNames({ required: props.required })}
      htmlFor={props.input.name}
    >
      {props.label}
    </label>
    <Select
      className="form-select"
      options={props.options}
      valueKey={props.valueKey}
      labelKey={props.labelKey}
      multi={props.multi}
    />
  </div>
)

selectField.propTypes = {
  input: React.PropTypes.shape({
    name: React.PropTypes.string,
  }).isRequired,
  label: React.PropTypes.string.isRequired,
  valueKey: React.PropTypes.string.isRequired,
  labelKey: React.PropTypes.string.isRequired,
  options: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
  multi: React.PropTypes.bool,
  required: React.PropTypes.bool,
}

selectField.defaultProps = {
  multi: false,
  required: false,
}

export default selectField
