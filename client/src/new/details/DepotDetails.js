import React, { Component } from 'react'
import request from 'superagent'
import Details from './Details'

// TODO refactor duplicate code in DepotDetails / FarmDetails / Details

// TODO move state to redux state

const EMPTY_PLACE = {
  ownerships: [],
  image: null,
  url: '',
  type: '',
  name: 'Loading...',
  city: '',
  description: '',
  maximum_members: 0,
  participation: '',
}

class DepotDetails extends Component {

  constructor(props) {
    super(props)
    this.state = { tab: 0, place: EMPTY_PLACE }
    request
      .get(`/api/v1/depots/${this.props.params.id}`)
      .end((err, res) => {
        if (!err) {
          this.setState({ place: res.body })
        }
      })
  }

  render() {
    return (
      <Details place={this.state.place} />
    )
  }
}

DepotDetails.propTypes = {
  params: React.PropTypes.shape({
    id: React.PropTypes.string,
  }).isRequired,
};

export default DepotDetails
