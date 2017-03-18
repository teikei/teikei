import request from 'superagent'
import Alert from 'react-s-alert';

export const SELECT_SEARCH_RESULT = 'SELECT_SEARCH_RESULT'
export const AUTOCOMPLETE_SEARCH = 'AUTOCOMPLETE_SEARCH'
export const AUTOCOMPLETE_SEARCH_SUCCESS = 'AUTOCOMPLETE_SEARCH_SUCCESS'
export const AUTOCOMPLETE_SEARCH_ERROR = 'AUTOCOMPLETE_SEARCH_ERROR'

export const selectSearchResult = payload =>
  ({ type: SELECT_SEARCH_RESULT, payload })

const autoCompleteSearchSuccess = payload =>
  ({ type: AUTOCOMPLETE_SEARCH_SUCCESS, payload })

const autoCompleteSearchError = (payload) => {
  Alert.error('Suchresultate konnten nicht geladen werden.')
  return ({ type: AUTOCOMPLETE_SEARCH_ERROR, payload, error: true })
}

export const autoCompleteSearch = payload => (dispatch, getState) => {
  request
    .get('/api/v1/geocode/autocomplete/combined')
    .query({
      text: payload,
      layers: 'address,street,locality,neighbourhood',
      'boundary.country': getState().search.country,
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

