import * as React from "react";
import { Link } from "react-router-dom";

import { Card, Box, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import PersonIcon from "@mui/icons-material/Person";

const useStyles = makeStyles({
  main: {
    overflow: "inherit",
    padding: 16,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
});

const UserCountCard = ({ name, link, count }) => {
  const classes = useStyles();
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
            <PersonIcon />
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
  );
};

export default UserCountCard;
