import React from 'react'
import conf from '../../../configuration'

const PREVIEW_TILE_WIDTH = 600
const PREVIEW_TILE_HEIGHT = 240
const PREVIEW_TILE_ZOOM_LEVEL = 14

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

  getPreviewTile() {
    if (!this.props.latitude && !this.props.longitude) {
      return '/assets/placeimage-placeholder.png'
    }
    return '//api.tiles.mapbox.com/v3/{APIKEY}/{LNG},{LAT},{ZOOM}/{WIDTH}x{HEIGHT}.png'
      .replace('{APIKEY}', conf.apiKey)
      .replace('{ZOOM}', PREVIEW_TILE_ZOOM_LEVEL)
      .replace('{WIDTH}', PREVIEW_TILE_WIDTH)
      .replace('{HEIGHT}', PREVIEW_TILE_HEIGHT)
      .replace('{LAT}', this.props.latitude)
      .replace('{LNG}', this.props.longitude)
  }

  handleChange(event) {
    const target = event.target;
    this.setState({
      [target.name]: target.value,
    });
  }

  render() {
    const previewTileUrl = `url(${this.getPreviewTile()})`

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
        <div className="preview-map" style={{ backgroundImage: previewTileUrl }}>
          <img
            className="preview-marker leaflet-marker-icon" src="/assets/marker-depot.svg"
            style={{ display: 'block' }}
          />
          <div className="alert-box alert" style={{ display: 'none' }}></div>
        </div>
      </div>
    )
  }
}

Geocoder.propTypes = {
  latitude: React.PropTypes.number,
  longitude: React.PropTypes.number,
  handleGeocode: React.PropTypes.func.isRequired,
  input: React.PropTypes.object,
}

Geocoder.defaultProps = {
  latitude: null,
  longitude: null,
  input: null,
};
