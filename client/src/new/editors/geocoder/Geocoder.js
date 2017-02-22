import React from 'react'
import PreviewTile from '../../common/PreviewTile'

export default class Geocoder extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      address: '',
      locality: '',
    };
    this.handleChange = this.handleChange.bind(this);
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

  handleChange(event) {
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
            name="address" type="text" maxLength="100" onChange={this.handleChange}
            onBlur={() => this.props.handleGeocode(this.state)}
          />
          <label htmlFor="locality">Ort</label>
          <input
            name="locality" type="text" maxLength="100" onChange={this.handleChange}
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
        <PreviewTile latitude={this.props.latitude} longitude={this.props.longitude} markerIcon={this.props.markerIcon} />
      </div>
    )
  }
}

Geocoder.propTypes = {
  latitude: React.PropTypes.number,
  longitude: React.PropTypes.number,
  handleGeocode: React.PropTypes.func.isRequired,
  markerIcon: React.PropTypes.oneOf(['Depot', 'Farm']).isRequired,
  input: React.PropTypes.object,
}

Geocoder.defaultProps = {
  latitude: null,
  longitude: null,
  input: null,
};
