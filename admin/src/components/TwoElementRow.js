import { Box } from '@material-ui/core'

const TwoElementRow = ({ left, right, ratio = 50 }) => (
  <Box display="flex">
    <Box flex={ratio} mr="0.5em">
      {left}
    </Box>
    <Box flex={100 - ratio} ml="0.5em">
      {right}
    </Box>
  </Box>
)

export default TwoElementRow
