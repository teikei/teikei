import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import Select from 'react-select'
import 'react-select/dist/react-select.css'
import classNames from 'classnames'
import _ from 'lodash'

const SelectField = ({
  input,
  meta,
  label,
  valueKey,
  labelKey,
  options,
  multi = null,
  required = false
}) => {
  const [value, setValue] = useState(input.value)

  useEffect(() => {
    if (!_.isEqual(input.value, value)) {
      setValue(input.value)
    }
  }, [input.value, value])

  const handleSelectChange = (value) => {
    setValue(value)
    input.onChange(value)
  }

  const { error, touched, warning } = meta

  return (
    <div className='form-control'>
      <label className={classNames({ required })} htmlFor={input.name}>
        {label}
      </label>
      <Select
        className='form-select'
        options={options}
        valueKey={valueKey}
        labelKey={labelKey}
        multi={multi}
        value={value}
        onChange={handleSelectChange}
      />
      {touched &&
        ((error && <p className='form-error'>{error}</p>) ||
          (warning && <p className='form-error'>{warning}</p>))}
    </div>
  )
}

SelectField.propTypes = {
  input: PropTypes.shape({
    name: PropTypes.string,
    onChange: PropTypes.func,
    value: PropTypes.arrayOf(PropTypes.object)
  }).isRequired,
  meta: PropTypes.shape({
    error: PropTypes.string,
    touched: PropTypes.string,
    warning: PropTypes.string
  }).isRequired,
  label: PropTypes.string.isRequired,
  valueKey: PropTypes.string.isRequired,
  labelKey: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(PropTypes.object).isRequired,
  multi: PropTypes.bool,
  required: PropTypes.bool
}

export default SelectField
