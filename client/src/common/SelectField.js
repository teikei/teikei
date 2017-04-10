import React, { Component, PropTypes } from 'react'
import Select from 'react-select'
import 'react-select/dist/react-select.css'
import classNames from 'classnames'
import isEqual from 'lodash.isequal'


class SelectField extends Component {

  constructor(props) {
    super(props)
    this.state = { value: props.input.value }
  }

  componentWillReceiveProps({ input }) {
    if (!isEqual(input.value, this.state.value)) {
      this.setState({ value: input.value })
    }
  }

  handleSelectChange = (value) => {
    this.setState({ value })
    this.props.input.onChange(value)
  }

  render() {
    return (
      <div className="form-control">
        <label
          className={classNames({ required: this.props.required })}
          htmlFor={this.props.input.name}
        >
          {this.props.label}
        </label>
        <Select
          className="form-select"
          options={this.props.options}
          valueKey={this.props.valueKey}
          labelKey={this.props.labelKey}
          multi={this.props.multi}
          value={this.state.value}
          onChange={this.handleSelectChange}
        />
      </div>
    )
  }
}

SelectField.propTypes = {
  input: PropTypes.shape({
    name: PropTypes.string,
    onChange: PropTypes.func,
    value: PropTypes.arrayOf(PropTypes.object),
  }).isRequired,
  label: PropTypes.string.isRequired,
  valueKey: PropTypes.string.isRequired,
  labelKey: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(PropTypes.object).isRequired,
  multi: PropTypes.bool,
  required: PropTypes.bool,
}

SelectField.defaultProps = {
  multi: false,
  required: false,
}

export default SelectField
