import { Box } from "@mui/material"

const TwoElementRow = ({ left, right, ratio = 50 }) => (
  <Box sx={{ display: "flex" }}>
    <Box sx={{ flex: ratio, marginRight: "0.5em" }}>{left}</Box>
    <Box sx={{ flex: 100 - ratio, marginRight: "0.5em" }}>{right}</Box>
  </Box>
)

export default TwoElementRow
