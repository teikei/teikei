import React from 'react'
import request from 'superagent'
import browserHistory from '../../browserHistory'

const handleSignInClick = () => browserHistory.push('/new/users/sign_in')

const signOut = () => {
  request.delete('/users/sign_out')
    .end((err, res) => {
      if (res.error) {
        console.log('LOGOUT FAILED:');
        res.body.errors.forEach(e => console.log(e));
      } else {
        console.log('LOGOUT OK');
        Teikei.currentUser = {}
        // TODO fix state management:
        // the state of the navigation component needs
        // to be changed to  loggedIn=false at this point
        browserHistory.push('/new')
      }
    })
}


const UserNav = props => (
  <div>
    <div className="user-nav-main user-nav-toggle" data-dropdown-target="#user-menu-dropdown">
      <a href="#user-menu-dropdown" id="user-menu-toggle">{props.username}</a>
    </div>
    <ul className="dropdown user-nav-dropdown" id="user-menu-dropdown">
      <li className="user-nav-account">
        <a href="/users/edit">
          {I18n.t('nav.edit_account')}</a>
      </li>
      <li className="user-nav-signout">
        <a href="#" onClick={signOut} rel="nofollow">{I18n.t('nav.logout')}</a>
      </li>
    </ul>
    {/* TODO: Move this into a separate component to not have this within the hamburger menu */}
    <div className="entries-nav" id="entries-nav">
      <ul>
        <li className="entries-nav-item entries-nav-list">
          <a id="my-entries" href="#">{I18n.t('nav.my_entries')}</a>
        </li>
        <li className="entries-nav-item entries-nav-new">
          <a href="#new-entry-dropdown" data-dropdown-target="#new-entry-dropdown">{I18n.t('nav.new_entry')}</a>
        </li>
      </ul>

      <ul className="dropdown entries-nav-dropdown" id="new-entry-dropdown">
        <li>
          <a id="add-depot" href="#">{I18n.t('nav.new_depot')}</a>
        </li>
        <li>
          <a id="add-farm" href="#">{I18n.t('nav.new_farm')}</a>
        </li>
      </ul>
    </div>
  </div>
)

UserNav.propTypes = {
  username: React.PropTypes.string.isRequired,
};

const GuestNav = () => (
  <div className="user-nav-main">
    <a href="#" id="signin" onClick={() => handleSignInClick()}>{I18n.t('nav.login')}</a>
  </div>
)

const Nav = props => (props.loggedIn ? <UserNav username={props.username} /> : <GuestNav />)

Nav.propTypes = {
  loggedIn: React.PropTypes.bool.isRequired,
  username: React.PropTypes.string,
};

const Navigation = props => (
  <div className="main-navigation" id="navigation">
    <nav className="user-nav">
      <ul>
        <li className="user-nav-settings" id="user-menu">
          <Nav loggedIn={props.loggedIn} username={props.username} />
        </li>
      </ul>
    </nav>
  </div>
)

Navigation.propTypes = {
  loggedIn: React.PropTypes.bool.isRequired,
  username: React.PropTypes.string,
};

export default Navigation
