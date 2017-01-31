import React, {Component} from 'react'
import request from 'superagent'
import Details from './Details'

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

class FarmDetails extends Component {

  constructor(props) {
    super(props)
    this.state = { tab: 0, place: EMPTY_PLACE }
    request
      .get(`/api/v1/farms/${this.props.params.id}`)
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

FarmDetails.propTypes = {
  params: React.PropTypes.shape({
    id: React.PropTypes.string,
  }).isRequired,
};

export default FarmDetails
