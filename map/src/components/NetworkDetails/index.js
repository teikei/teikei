import React, { Component, Fragment } from 'react'
import _ from 'lodash'
import classNames from 'classnames'
import i18n from '../../i18n'
import { emptyFeature, featurePropType } from '../../common/geoJsonUtils'
import ContactTabContainer from '../../containers/Details/tabs/ContactTabContainer'

import {
  Breadcrumb,
  BreadcrumbItem,
  Link,
  Button,
  ToggleSmall,
  Tag
} from 'carbon-components-react'
// const ContactButton = toggleContact => (
//   <button onClick={toggleContact} className="details-contact-button">
//     Kontakt
//   </button>
// )
//
// const ContactTab = place => <ContactTabContainer place={place} />

import './styles.scss'

const MainSection = ({ divider, children }) => {
  return (
    <div
      className={classNames('bx--row', 'networkdetails--section', {
        'networkdetails--divider': divider
      })}
    >
      <div className="bx--col-xs-12 ">
        <div className="bx--grid">{children}</div>
      </div>
    </div>
  )
}

const NetworkHeader = props => (
  <Fragment>
    <div className="bx--row">
      <div className="bx--col-xs-12 ">
        <Breadcrumb className="mb-layout-sm" noTrailingSlash={true}>
          <BreadcrumbItem href="/#">Übersicht</BreadcrumbItem>
          <BreadcrumbItem href="#">Berlin</BreadcrumbItem>
        </Breadcrumb>
      </div>
    </div>
    <div className="bx--row">
      <div className="bx--col-xs-12 ">
        <h2 className="mb-spacing-2xs">Siebenzwergeland</h2>
        <h3 className="mb-spacing-2xs">16567 Mühlenbeck</h3>
        <div className="mb-spacing-xl">
          <Link href="#">www.siebenzwergeland.jimdo.com</Link>
        </div>
        <p className="mb-spacing-xl">
          Wir, das sind Familie Lampen, mit tatkräftiger Unterstützung von zwei
          engagierten Auszubildenden, bewirtschaften einen Bioland
          Grünland-Milchkuhbetrieb im nördlichen Emsland in den Emsauen.
          Gemeinsam haben wir uns seit Mai 2017…
        </p>
      </div>
    </div>
    <div className="bx--row mb-layout-sm networkdetails--divider">
      <div className="bx--col-xs-6">
        <Button
          className="mb-layout-sm"
          onClick={_.noop}
          onFocus={_.noop}
          href="#"
        >
          Kontakt
        </Button>
      </div>
      <div className="bx--col-xs-6">
        {/*TODO disable wrapping of label*/}
        Diesem Betrieb folgen
        <ToggleSmall
          className="some-class"
          // toggled={false}
          ariaLabel="Label Name"
          onChange={_.noop}
          onToggle={_.noop}
          id="followToggle"
        />
      </div>
    </div>
  </Fragment>
)

const NetworkOffer = props => (
  <div className="bx--row mb-layout-sm networkdetails--divider">
    <div className="bx--col-xs-12 ">
      <h4 className="mb-spacing-md">Angebot</h4>
      <div className="tags mb-spacing-md">
        <Tag type="beta">Gemüse</Tag>
        <Tag type="beta">Obst</Tag>
        <Tag type="beta">Eier</Tag>
        <Tag type="beta">Honig</Tag>
        <Tag type="beta">Fleisch</Tag>
        <Tag type="beta">Milchprodukte</Tag>
      </div>
      <p className="mb-layout-sm">Wir nutzen sortenreines Saatgut.</p>
    </div>
  </div>
)

const NetworkConcepts = props => (
  <div className="bx--row mb-layout-sm">
    <div className="bx--col-xs-12 ">
      <h4 className="mb-layout-sm">Wirtschaftsweise</h4>
      <p>ökologischer Anbau</p>
      <p>Solidarische Landwirtschaft seit 2011</p>
      <p>Demeter zertifiziert</p>
    </div>
  </div>
)

const NetworkMembership = props => (
  <Fragment>
    <div className="bx--row">
      <div className="bx--col-xs-12">
        <h4 className="mb-layout-sm">Mitgliedschaft</h4>
        <p className="mb-layout-sm">
          Da wir uns immer weiterentwickeln, seid ihr herzlich willkommen, auch
          daran mitzuwirken! Auch kann gelegentlich Mithilfe beim Gemüseanbau
          oder der Milchverarbeitung gefragt sein. Dies soll aber auf keinen
          Fall ein »Muss« für unsere Solawist@s werden!
        </p>
        <p> Mitgliederzahl: bis zu 200</p>
        <p className="mb-layout-sm">Wir nehmen bald wieder neue Mitglieder auf.</p>
      </div>
    </div>
    <div className="bx--row">
      <div className="bx--col-xs-12">
        <Button
          className="some-class"
          onClick={_.noop}
          onFocus={_.noop}
          href="#"
        >
          Kontakt
        </Button>
      </div>
    </div>
  </Fragment>
)

const Depot = props => (
  <div className="bx--row mb-layout-sm">
    <div className="bx--col-xs-9">
      <h4>Abholstelle Marienberg</h4>
      <p>12345 Marienberg</p>
      <p>Abholtag: Montag</p>
      <Link href="#">Details</Link>
    </div>
    <div className="bx--col-xs-3">
      <Button className="some-class" onClick={_.noop} onFocus={_.noop} href="#">
        Kontakt
      </Button>
    </div>
  </div>
)

class NetworkDetails extends Component {
  constructor(props) {
    super(props)
    this.state = { isContactActive: false }
  }

  toggleContact = () => {
    this.setState({
      isContactActive: !this.state.isContactActive
    })
  }

  render() {
    const { feature } = this.props
    return (
      <article className="details">
        <div className="bx--grid">
          <MainSection divider>
            <NetworkHeader />
            <NetworkOffer />
            <NetworkConcepts />
          </MainSection>
          <MainSection divider>
            <Depot />
            <Depot />
          </MainSection>
          <MainSection>
            <NetworkMembership />
          </MainSection>
        </div>
      </article>
    )
  }
}

NetworkDetails.propTypes = {
  feature: featurePropType.isRequired
}

NetworkDetails.defaultProps = {
  feature: emptyFeature
}

export default NetworkDetails
