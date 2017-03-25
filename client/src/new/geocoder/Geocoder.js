import React from 'react'
import isEqual from 'lodash.isequal'
import PreviewTile from '../common/PreviewTile'

export default class Geocoder extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      address: '',
      locality: '',
    };
  }

  componentWillReceiveProps({ input }) {
    if (!isEqual(input.value, this.state.value)) {
      this.setState({
        locality: input.value.city,
        address: input.value.address,
        latitude: input.value.latitude,
        longitude: input.value.longitude,
      })
    }
  }

  componentWillUpdate(nextProps, nextState) {
    // trigger onChange in case the geocoder is being used
    // as a redux-form component
    if (this.props.input) {
      this.props.input.onChange({
        latitude: nextProps.latitude,
        longitude: nextProps.longitude,
        address: nextState.address,
        locality: nextState.locality,
      })
    }
  }

  handleChange = (event) => {
    const target = event.target;
    this.setState({
      [target.name]: target.value,
    });
  }

  render() {
    return (
      <div name="geocoder">
        <div className="geocoder-controls">
          <label htmlFor="address">Straße und Hausnummer</label>
          <input
            name="address"
            type="text"
            value={this.state.address}
            maxLength="100"
            onChange={this.handleChange}
            onBlur={() => this.props.handleGeocode(this.state)}
          />
          <label htmlFor="locality">Ort</label>
          <input
            name="locality"
            type="text"
            value={this.state.locality}
            maxLength="100"
            onChange={this.handleChange}
            onBlur={() => this.props.handleGeocode(this.state)}
          />
          <button
            className="small button preview-button" onClick={(e) => {
              e.preventDefault();
              this.props.handleGeocode(this.state)
            }}
          >
            Ort auf Karte anzeigen
          </button>
          <p className="explanation">
            Diese Angaben werden ausschließlich dazu verwendet, den Ort auf der Karte zu markieren.
            Die Adresse wird weder im Web veröffentlicht noch anderweitig weitergegeben.
          </p>
        </div>
        <PreviewTile
          latitude={this.state.latitude}
          longitude={this.state.longitude}
          markerIcon={this.props.markerIcon}
        />
      </div>
    )
  }
}

Geocoder.propTypes = {
  latitude: React.PropTypes.number,
  longitude: React.PropTypes.number,
  handleGeocode: React.PropTypes.func.isRequired,
  markerIcon: React.PropTypes.oneOf(['Depot', 'Farm']).isRequired,
  input: React.PropTypes.shape({
    name: React.PropTypes.string,
    onChange: React.PropTypes.func,
    value: React.PropTypes.object,
  }).isRequired,
}

Geocoder.defaultProps = {
  latitude: null,
  longitude: null,
}
