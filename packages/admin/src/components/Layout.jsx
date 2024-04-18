import { Layout } from "react-admin";

import AppMenu from "./AppMenu";
import AppBar from "./AppBar";

const AppLayout = (props) => (
  <Layout {...props} menu={AppMenu} appBar={AppBar} />
);

export default AppLayout;
