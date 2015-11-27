'use strict';

import React from 'react';

export default class Search extends React.Component {

  state = {
    value: this.props.defaultValue
  }

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <input
        onChange={event => this._handleChange(event.target.value)}
        defaultValue={this.state.value}
        type='text' />
    );
  }

  _handleChange(value) {
    this.setState({value});
  }
}

