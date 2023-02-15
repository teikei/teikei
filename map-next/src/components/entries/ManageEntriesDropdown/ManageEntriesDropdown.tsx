import React, { useState } from "react";
import { useMutation } from "react-query";
import classNames from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown } from "@fortawesome/free-solid-svg-icons";
import useOutsideClick from "../../../common/useOutsideClick";

interface Props {}

export const ManageEntriesDropdown: React.FC = () => {
  const [open, setOpen] = useState(false);

  const ref = useOutsideClick<HTMLDivElement>(() => setOpen(false));

  return (
    <div
      className={classNames(["dropdown", "mx-2", { "is-active": open }])}
      ref={ref}
    >
      <div className="dropdown-trigger">
        <button
          className="button"
          aria-haspopup="true"
          aria-controls="dropdown-menu"
          onClick={() => setOpen(!open)}
        >
          <span>Einträge hinzufügen/bearbeiten</span>
          <span className="icon is-small">
            <FontAwesomeIcon icon={faAngleDown} />
          </span>
        </button>
      </div>
      <div className="dropdown-menu" id="dropdown-menu" role="menu">
        <div className="dropdown-content">
          <a href="/myentries" className="dropdown-item">
            Meine Einträge
          </a>
          <a href="/depots/new" className="dropdown-item">
            Abholstelle hinzufügen
          </a>
          <a href="/farms/new" className="dropdown-item">
            Betrieb hinzufügen
          </a>
          <a href="/initiatives/new" className="dropdown-item">
            Initiative hinzufügen
          </a>
        </div>
      </div>
    </div>
  );
};

export default ManageEntriesDropdown;
