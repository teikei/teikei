import { browserHistory } from 'react-router'

export const MY_ENTRIES_SHOW_LIST = 'MY_ENTRIES_SHOW_LIST'

export const beginMyEntries = () => {
  browserHistory.push('/new/myentries')
  return ({ type: MY_ENTRIES_SHOW_LIST })
}
