import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Select from 'react-select'
import 'react-select/dist/react-select.css'
import classNames from 'classnames'
import _ from 'lodash'

class SelectField extends Component {
  constructor(props) {
    super(props)
    this.state = { value: props.input.value }
  }

  componentWillReceiveProps({ input }) {
    if (!_.isEqual(input.value, this.state.value)) {
      this.setState({ value: input.value })
    }
  }

  handleSelectChange = value => {
    this.setState({ value })
    this.props.input.onChange(value)
  }

  render() {
    const {
      meta: { error, touched, warning },
      required,
      input,
      label,
      options,
      valueKey,
      labelKey,
      multi,
      value
    } = this.props
    return (
      <div className="form-control">
        <label className={classNames({ required })} htmlFor={input.name}>
          {label}
        </label>
        <Select
          className="form-select"
          options={options}
          valueKey={valueKey}
          labelKey={labelKey}
          multi={multi}
          value={value}
          onChange={this.handleSelectChange}
        />
        {touched &&
          ((error && <p className="form-error">{error}</p>) ||
            (warning && <p className="form-error">{warning}</p>))}
      </div>
    )
  }
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

SelectField.defaultProps = {
  multi: false,
  required: false
}

export default SelectField
