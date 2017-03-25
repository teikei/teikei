import React, { Component } from 'react'
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
  input: React.PropTypes.shape({
    name: React.PropTypes.string,
    onChange: React.PropTypes.func,
    value: React.PropTypes.arrayOf(React.PropTypes.object),
  }).isRequired,
  label: React.PropTypes.string.isRequired,
  valueKey: React.PropTypes.string.isRequired,
  labelKey: React.PropTypes.string.isRequired,
  options: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
  multi: React.PropTypes.bool,
  required: React.PropTypes.bool,
}

SelectField.defaultProps = {
  multi: false,
  required: false,
}

export default SelectField
