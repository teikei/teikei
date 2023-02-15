import React from "react";

export const AccountNavDropdown: React.FC = () => (
  <div className="dropdown is-active">
    <div className="dropdown-trigger">
      <button
        className="button"
        aria-haspopup="true"
        aria-controls="dropdown-menu"
      >
        <span>Dropdown button</span>
        <span className="icon is-small">
          <i className="fas fa-angle-down" aria-hidden="true"></i>
        </span>
      </button>
    </div>
    <div className="dropdown-menu" id="dropdown-menu" role="menu">
      <div className="dropdown-content">
        <a
          href="map-next/src/components/account/AccountNavDropdown#"
          className="dropdown-item"
        >
          Dropdown item
        </a>
        <a className="dropdown-item">Other dropdown item</a>
        <a
          href="map-next/src/components/account/AccountNavDropdown#"
          className="dropdown-item is-active"
        >
          Active dropdown item
        </a>
        <a
          href="map-next/src/components/account/AccountNavDropdown#"
          className="dropdown-item"
        >
          Other dropdown item
        </a>
        <hr className="dropdown-divider" />
        <a
          href="map-next/src/components/account/AccountNavDropdown#"
          className="dropdown-item"
        >
          With a divider
        </a>
      </div>
    </div>
  </div>
);

export default AccountNavDropdown;
