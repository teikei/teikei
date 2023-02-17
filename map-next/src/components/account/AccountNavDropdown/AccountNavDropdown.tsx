import React, { Fragment } from "react";
import { useMutation } from "react-query";
import classNames from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleDown,
  faArrowRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";
import { Popover, Transition } from "@headlessui/react";

import { queryClient, signOut } from "../../../api/api";
import { User } from "../../../types";

interface Props {
  user: User;
}

export const AccountNavDropdown: React.FC<Props> = ({ user }) => {
  const signOutMutation = useMutation(() => signOut(), {
    onSuccess: () => {
      return queryClient.invalidateQueries("authenticate");
    },
  });

  return (
    <>
      <Popover className="relative">
        {({ open }) => (
          <div className={classNames(["dropdown", { "is-active": open }])}>
            <>
              <Popover.Button className="button dropdown-trigger is-white">
                <span>{user.name}</span>
                <span className="icon is-small">
                  <FontAwesomeIcon icon={faAngleDown} />
                </span>
              </Popover.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 translate-y-1"
                enterTo="opacity-100 translate-y-0"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 translate-y-1"
              >
                <Popover.Panel
                  className="dropdown-menu"
                  id="dropdown-menu"
                  role="menu"
                >
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
                </Popover.Panel>
              </Transition>
            </>
          </div>
        )}
      </Popover>
    </>
  );
};

export default AccountNavDropdown;
