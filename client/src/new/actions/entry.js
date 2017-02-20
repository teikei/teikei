// import request from 'superagent'

export const ENTRY_ADD_DEPOT = 'ENTRY_ADD_DEPOT'
export const ENTRY_ADD_FARM = 'ENTRY_ADD_FARM'

export const ENTRY_EDIT_DEPOT = 'ENTRY_EDIT_DEPOT'
export const ENTRY_EDIT_FARM = 'ENTRY_EDIT_FARM'

export const ENTRY_DELETE_FARM = 'ENTRY_DELETE_FARM'
export const ENTRY_DELETE_DEPOT = 'ENTRY_DELETE_DEPOT'

export const ENTRY_SHOW_MY_ENTRIES = 'ENTRY_SHOW_MY_ENTRIES'

export const showMyEntries = () => ({ type: ENTRY_SHOW_MY_ENTRIES })
export const addDepot = () => ({ type: ENTRY_ADD_DEPOT })
export const addFarm = () => ({ type: ENTRY_ADD_FARM })
