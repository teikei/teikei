import React from 'react'

const UserNavDropdown = ({ toggle, onEditClick, onSignOutClick }) => (
  toggle === false ? null : (
    <ul className="dropdown user-nav-dropdown">
      <li className="user-nav-account">
        <button onClick={() => onEditClick()}>{I18n.t('nav.edit_account')}</button>
      </li>
      <li className="user-nav-signout">
        <button onClick={() => onSignOutClick()} rel="nofollow">{I18n.t('nav.logout')}</button>
      </li>
    </ul>
  )
)
UserNavDropdown.propTypes = {
  toggle: React.PropTypes.bool.isRequired,
  onSignOutClick: React.PropTypes.func.isRequired,
  onEditClick: React.PropTypes.func.isRequired,
}

class AccountNav extends React.Component {

  constructor(props) {
    super(props);
    this.state = { toggleDropdown: false }
  }

  toggleDropdown = (event) => {
    event.preventDefault();
    this.setState({
      toggleDropdown: !this.state.toggleDropdown,
    })
  }

  render() {
    return (
      <div>
        <div className="user-nav-main user-nav-toggle">
          <a onClick={this.toggleDropdown}>{this.props.username}</a>
        </div>

        <UserNavDropdown
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
