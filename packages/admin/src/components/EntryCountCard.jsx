import * as React from "react"
import { Card, Box, Typography } from "@mui/material"
import { makeStyles } from "@mui/styles"
import { Link } from "react-router-dom"

import farmIcon from "../assets/marker-farm.svg"
import initiativeIcon from "../assets/marker-initiative.svg"
import depotIcon from "../assets/marker-depot.svg"

const icons = {
  Farms: farmIcon,
  Initiatives: initiativeIcon,
  Depots: depotIcon,
}

const useStyles = makeStyles({
  main: {
    overflow: "inherit",
    padding: 16,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    "& .icon": {
      color: "#dc2440",
    },
  },
})

const EntryCountCard = ({ name, link, count }) => {
  const classes = useStyles()
  return (
    <Card
      className={classes.card}
      sx={{
        "& a": {
          textDecoration: "none",
          color: "inherit",
        },
      }}
    >
      <Link to={link}>
        <div className={classes.main}>
          <Box width="3em" className="icon">
            <img src={icons[name]} />
          </Box>
          <Box textAlign="right">
            <Typography color="textSecondary">{name}</Typography>
            <Typography variant="h5" component="h2">
              {count || " "}
            </Typography>
          </Box>
        </div>
      </Link>
    </Card>
  )
}

export default EntryCountCard
