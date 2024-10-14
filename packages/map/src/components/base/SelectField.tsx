import { useState, useEffect } from 'react'
import Select from 'react-select'
import 'react-select/dist/react-select.css'
import classNames from 'classnames'
import _ from 'lodash'

interface SelectFieldProps {
  input: {
    name: string
    onChange: (value: any) => void
    value: any[]
  }
  meta: {
    error?: string
    touched?: boolean
    warning?: string
  }
  label: string
  valueKey: string
  labelKey: string
  options: any[]
  multi?: boolean | null
  required?: boolean
}

const SelectField = ({
  input,
  meta,
  label,
  valueKey,
  labelKey,
  options,
  multi = null,
  required = false
}: SelectFieldProps) => {
  const [value, setValue] = useState(input.value)

  useEffect(() => {
    if (!_.isEqual(input.value, value)) {
      setValue(input.value)
    }
  }, [input.value, value])

  const handleSelectChange = (value: any) => {
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
        // @ts-ignore
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

export default SelectField
