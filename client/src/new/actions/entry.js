import request from 'superagent'
import { browserHistory } from 'react-router'

export const ENTRY_ADD_DEPOT = 'ENTRY_ADD_DEPOT'
export const ENTRY_ADD_FARM = 'ENTRY_ADD_FARM'

export const ENTRY_EDIT_DEPOT = 'ENTRY_EDIT_DEPOT'
export const ENTRY_EDIT_FARM = 'ENTRY_EDIT_FARM'

export const ENTRY_DELETE_FARM = 'ENTRY_DELETE_FARM'
export const ENTRY_DELETE_DEPOT = 'ENTRY_DELETE_DEPOT'

export const ENTRY_SHOW_MY_ENTRIES = 'ENTRY_SHOW_MY_ENTRIES'

export const showMyEntries = () => ({ type: ENTRY_SHOW_MY_ENTRIES })

export const addDepot = () => ({ type: ENTRY_ADD_DEPOT })
export const beginAddDepot = () => (dispatch) => {
  browserHistory.push('/new/depots/add')
  dispatch(addDepot())
}
export const createDepotError = () => {}
export const createDepotSuccess = () => {}
export const createDepot = payload => (dispatch) => {
  // fill missing values
  const filledPayload = payload
  if (!payload.places) {
    filledPayload.places = ''
  }
  request
    .post('/api/v1/depots', filledPayload)
    .end((err, res) => {
      debugger
      if (res.body.errors) {
        dispatch(createDepotError(res.body.errors))
      } else {
        dispatch(createDepotSuccess(res.body))
        browserHistory.push('/new');
      }
    })
}

export const addFarm = () => ({ type: ENTRY_ADD_FARM })
export const beginAddFarm = () => (dispatch) => {
  browserHistory.push('/new/farms/add')
  dispatch(addFarm())
}
export const createFarm = payload => (dispatch) => {
  console.log('saving farm!!!')
  console.log(payload)
}
