import React from "react";
import { useQuery } from "react-query";

import { authenticate } from "../../../api/api";
import AccountNavDropdown from "../../account/AccountNavDropdown/AccountNavDropdown";
import ManageEntriesDropdown from "../../entries/ManageEntriesDropdown/ManageEntriesDropdown";

const Navigation = () => {
  const { data, isSuccess } = useQuery(["authenticate"], authenticate);
  const { user } = data || {};

  return (
    <nav className="navbar" role="navigation" aria-label="main navigation">
      <div className="navbar-end">
        <div className="navbar-item">
          <div className="buttons">
            {isSuccess && user && <AccountNavDropdown user={user} />}
            {(isSuccess && user && <ManageEntriesDropdown />) || (
              <a className="button is-primary" href="/users/sign-in">
                <strong>Einträge hinzufügen / bearbeiten</strong>
              </a>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
