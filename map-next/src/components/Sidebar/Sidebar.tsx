import React from "react";

import styles from "./Sidebar.module.css";
import classNames from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import { useStore } from "../../store";
import { useQuery } from "react-query";
import { getEntry } from "../../api";
import Details from "../Details/Details";

const Sidebar = () => {
  const toggleProfilePage = useStore((state) => state.toggleProfilePage);
  const profilePageOpen = useStore((state) => state.profilePageOpen);
  const type = useStore((state) => state.type);
  const id = useStore((state) => state.id);

  const { data, isSuccess } = useQuery(
    ["fetchEntry", type, id],
    () => getEntry(type, id),
    { enabled: profilePageOpen }
  );
  return (
    <div
      className={classNames(styles.root, "panel", {
        [styles.rootCollapsed]: !profilePageOpen,
      })}
    >
      <div className="p-3">
        <FontAwesomeIcon
          icon={faBars}
          pull="right"
          onClick={toggleProfilePage}
        />
      </div>
      <div
        className={classNames(styles.content, {
          [styles.contentCollapsed]: !profilePageOpen,
        })}
      >
        {isSuccess && <Details entry={data} />}
      </div>
    </div>
  );
};

export default Sidebar;
