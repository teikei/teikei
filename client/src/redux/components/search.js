import React from 'react';
import request from 'superagent';

export default class Search extends React.Component {

  static propTypes = {
    defaultValue: React.PropTypes.string.isRequired,
  };

  constructor(props) {
    super(props);
  }

  state = {
    location: this.props.defaultValue,
  };

  handleKeyDown = (event) => {
    if (event.keyCode === 13) {
      request
        .get('/api/v1/geocode')
        .query(this.state)
        .end((err, res) => {
          if (err) {
            console.log(err);
          } else {
            Places.mapView.centerTo(res.body[0].attrs.lat, res.body[0].attrs.lon);
          }
        });
    }
  };

  handleChange = (event) => {
    this.setState({ location: event.target.value });
  };

  render() {
    return (
      <input
        onChange={this.handleChange}
        onKeyDown={this.handleKeyDown}
        defaultValue={this.state.location}
        type="text"
      />
    );
  }
}
