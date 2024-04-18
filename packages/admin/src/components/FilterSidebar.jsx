import { Card, CardContent } from "@mui/material";

const FarmsFilterSidebar = ({ children }) => (
  <Card sx={{ order: -1, mr: 2, mt: 8, width: 250 }}>
    <CardContent>{children}</CardContent>
  </Card>
);

export default FarmsFilterSidebar;
