import React from 'react'

const AccountNavDropdown = ({ toggle, onEditClick, onSignOutClick }) => (
  toggle === false ? null : (
    <ul className="dropdown account-nav-dropdown">
      <li className="user-nav-account">
        <button onClick={() => onEditClick()}>{I18n.t('nav.edit_account')}</button>
      </li>
      <li className="user-nav-signout">
        <button onClick={() => onSignOutClick()} rel="nofollow">{I18n.t('nav.logout')}</button>
      </li>
    </ul>
  )
)
AccountNavDropdown.propTypes = {
  toggle: React.PropTypes.bool.isRequired,
  onSignOutClick: React.PropTypes.func.isRequired,
  onEditClick: React.PropTypes.func.isRequired,
}

class AccountNav extends React.Component {

  constructor(props) {
    super(props);
    this.state = { toggleDropdown: false }
  }

  toggleDropdown = () => {
    this.setState({
      toggleDropdown: !this.state.toggleDropdown,
    })
  }

  render() {
    return (
      <div className="account-nav">
        <button className="account-nav-toggle" onClick={this.toggleDropdown}>
          {this.props.username}
        </button>
        <AccountNavDropdown
          toggle={this.state.toggleDropdown}
          onEditClick={this.props.onEditClick}
          onSignOutClick={this.props.onSignOutClick}
        />
      </div>
    )
  }
}

AccountNav.propTypes = {
  onSignOutClick: React.PropTypes.func.isRequired,
  onEditClick: React.PropTypes.func.isRequired,
  username: React.PropTypes.string.isRequired,
}

export default AccountNav
