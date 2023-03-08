import React from "react";
import { useQuery } from "react-query";
import classNames from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

import { EntryType } from "@/types";
import { useStore } from "@/store";
import { getEntry } from "@/api";
import Details from "@/components/details/Details";

// TODO port to tailwind
import styles from "./Sidebar.module.css";

const Sidebar = () => {
  const toggleProfilePage = useStore((state) => state.toggleProfilePage);
  const profilePageOpen = useStore((state) => state.profilePageOpen);
  const type = useStore((state) => state.type);
  const id = useStore((state) => state.id);

  const { data, isSuccess } = useQuery(
    ["fetchEntry", type, id],
    () => getEntry({ type: type as EntryType, id: id as number }),
    { enabled: profilePageOpen && id !== null && type !== null }
  );
  return (
    <div
      className={classNames(styles.root, "panel", {
        [styles.rootCollapsed]: !profilePageOpen,
      })}
    >
      <div className="p-3">
        <FontAwesomeIcon
          icon={faXmark}
          pull="right"
          onClick={toggleProfilePage}
          size="lg"
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
