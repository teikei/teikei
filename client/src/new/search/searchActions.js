import request from 'superagent'
import Alert from 'react-s-alert';

export const AUTOCOMPLETE_UPDATE_VALUE = 'AUTOCOMPLETE_UPDATE_VALUE'
export const AUTOCOMPLETE_SEARCH = 'AUTOCOMPLETE_SEARCH'
export const AUTOCOMPLETE_SEARCH_SUCCESS = 'AUTOCOMPLETE_SEARCH_SUCCESS'
export const AUTOCOMPLETE_SEARCH_ERROR = 'AUTOCOMPLETE_SEARCH_ERROR'

const autoCompleteUpdateValue = payload =>
  ({ type: AUTOCOMPLETE_UPDATE_VALUE, payload })

const autoCompleteSearchSuccess = payload =>
  ({ type: AUTOCOMPLETE_SEARCH_SUCCESS, payload })

const autoCompleteSearchError = (payload) => {
  Alert.error('Suchresultate konnten nicht geladen werden.')
  return ({ type: AUTOCOMPLETE_SEARCH_ERROR, payload, error: true })
}

export const autoCompleteSearch = value => (dispatch, getState) => {
  request
    .get('/api/v1/geocode/autocomplete/combined')
    .query({
      text: value,
      layers: 'address,street,locality,neighbourhood',
      'boundary.country': getState().map.country,
    })
    .end((err, res) => {
      if (err) {
        dispatch(autoCompleteSearchError(err));
      } else {
        let locations = []
        locations = locations.concat(res.body.map(l => ({
          type: l.type,
          name: l.name,
          lat: l.lat,
          lon: l.lon,
          key: l.id,
          id: l.type === 'location' ? '' : l.id,
        })))
        dispatch(autoCompleteSearchSuccess(locations))
      }
    })
}

export const autoComplete = value => (dispatch) => {
  dispatch(autoCompleteUpdateValue(value))
  dispatch(autoCompleteSearch(value))
}

