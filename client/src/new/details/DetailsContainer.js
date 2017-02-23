import { connect } from 'react-redux'
import { EMPTY_PLACE } from '../editors/editorReducer'
import Details from './Details'

const mapStateToProps = ({ editor }) => ({
  place: editor.currentPlace ? editor.currentPlace : EMPTY_PLACE,
})

const mapDispatchToProps = () => ({
})

const DetailsContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Details)

export default DetailsContainer
