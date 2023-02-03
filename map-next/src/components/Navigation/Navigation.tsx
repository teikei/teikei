const Navigation = () => (
  <nav className="navbar" role="navigation" aria-label="main navigation">
    <div className="navbar-end">
      <div className="navbar-item">
        <div className="buttons">
          <a className="button is-primary" href="/users/sign-in">
            <strong>Einträge hinzufügen / bearbeiten</strong>
          </a>
          {/*<a className="button is-light">Log in</a>*/}
        </div>
      </div>
    </div>
  </nav>
);

export default Navigation;
