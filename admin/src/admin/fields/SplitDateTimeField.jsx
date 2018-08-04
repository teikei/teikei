import React from 'react'
import crudl from '@crudlio/crudl/dist/crudl'
import PropTypes from 'prop-types'

class SplitDateTimeField extends React.Component {
  static propTypes = {
    getTime: PropTypes.func.isRequired,
    getDate: PropTypes.func.isRequired
  }

  render() {
    const customDateFieldStyle = {
      display: 'inline-block',
      width: '24%',
      marginRight: '2%'
    }
    const customTimeFieldStyle = {
      display: 'inline-block',
      width: '24%'
    }
    const { id, input, disabled, getTime, getDate } = this.props
    return (
      <div className="field">
        <input
          id={id + '-date'}
          type="text"
          autoComplete="off"
          readOnly
          disabled={disabled}
          value={getDate(input.value)}
          style={customDateFieldStyle}
        />
        <input
          id={id + '-time'}
          type="text"
          autoComplete="off"
          readOnly
          disabled={disabled}
          value={getTime(input.value)}
          style={customTimeFieldStyle}
        />
        <input type="hidden" readOnly {...input} />
      </div>
    )
  }
}

export default crudl.baseField(SplitDateTimeField)
