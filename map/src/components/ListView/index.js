import React from 'react'

import './styles.scss'
import Search from '../../containers/Search'

const ListViewTitle = ({ children }) => (
  <h4 className="tk-listview-title">{children}</h4>
)

const ListViewNewsItem = props => (
  <div className="tk-listview-newsitem">
    <div className="tk-listview-newsitem__meta">
      19. Oktober 2018 / Biokräuterei Oranienburg
    </div>
    <div className="tk-listview__main">
      <div className="tk-listview-newsitem__title">
        Die Biokräuterei nimmt wieder neue Mitglieder auf.
      </div>
      <a className="tk-listview-newsitem__link">Mehr lesen</a>
    </div>
  </div>
)

const ListViewNews = props => (
  <div className="tk-listview-news">
    <ListViewNewsItem />
    <ListViewNewsItem />
  </div>
)

const ListViewNetworkItem = props => (
  <div className="tk-listview-networksitem">
    <div className="tk-listview-networksitem__main">
      <div className="tk-listview-networksitem__title">
        Biokräuterei Oberhavel
      </div>
      <div className="tk-listview-networksitem__address">
        16515 Oranienburg OT Lehnitz
      </div>
      <a className="tk-listview-networksitem__link">biokraeuterei.de</a>
    </div>
    <i className="tk-listview-networksitem__arrow" />
  </div>
)

const ListViewNetworks = props => (
  <div className="tk-listview-networks">
    <ListViewNetworkItem />
    <ListViewNetworkItem />
    <ListViewNetworkItem />
    <ListViewNetworkItem />
    <ListViewNetworkItem />
    <ListViewNetworkItem />
    <ListViewNetworkItem />
    <ListViewNetworkItem />
    <ListViewNetworkItem />
    <ListViewNetworkItem />
    <ListViewNetworkItem />
    <ListViewNetworkItem />
  </div>
)

const ListView = props => (
  <div className="tk-listview__container">
    <Search useHashRouter={true} />
    <ListViewTitle>Neues aus dieser Region</ListViewTitle>
    <ListViewNews />
    <ListViewTitle>Betriebe und Initiativen in dieser Region</ListViewTitle>
    <ListViewNetworks />
  </div>
)

export default ListView
