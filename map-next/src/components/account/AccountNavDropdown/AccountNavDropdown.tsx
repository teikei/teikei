import React, { useState } from "react";
import { useMutation } from "react-query";
import classNames from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleDown,
  faArrowRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";

import { queryClient, signOut } from "../../../api/api";
import { User } from "../../../types";
import useOutsideClick from "../../../common/useOutsideClick";

interface Props {
  user: User;
}

export const AccountNavDropdown: React.FC<Props> = ({ user }) => {
  const [open, setOpen] = useState(false);

  const signOutMutation = useMutation(() => signOut(), {
    onSuccess: () => {
      return queryClient.invalidateQueries("authenticate");
    },
  });

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
          <span>{user.name}</span>
          <span className="icon is-small">
            <FontAwesomeIcon icon={faAngleDown} />
          </span>
        </button>
      </div>
      <div className="dropdown-menu" id="dropdown-menu" role="menu">
        <div className="dropdown-content">
          <a
            href="map-next/src/components/account/AccountNavDropdown#"
            className="dropdown-item"
          >
            Benutzerdaten anpassen
          </a>
          <a
            href="map-next/src/components/account/AccountNavDropdown#"
            className="dropdown-item"
          >
            Passwort ändern
          </a>
          <hr className="dropdown-divider" />
          <a
            className="dropdown-item"
            href="#"
            onClick={() => signOutMutation.mutate()}
          >
            Abmelden
            <FontAwesomeIcon
              icon={faArrowRightFromBracket}
              style={{ marginLeft: "4px" }}
            />
          </a>
        </div>
      </div>
    </div>
  );
};

export default AccountNavDropdown;
