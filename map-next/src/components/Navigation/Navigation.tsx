import { useQuery } from "react-query";
import { authenticate } from "../../api";

const Navigation = () => {
  const { data, isSuccess, isError } = useQuery(["authenticate"], authenticate);
  const { user } = data || {};

  return (
    <nav className="navbar" role="navigation" aria-label="main navigation">
      <div className="navbar-end">
        <div className="navbar-item">
          <div className="buttons">
            {isSuccess && (
              <button className="button is-primary">
                Logged in as {user?.name}
              </button>
            )}
            {isError && (
              <a className="button is-primary" href="/users/sign-in">
                <strong>Einträge hinzufügen / bearbeiten</strong>
              </a>
            )}
            {isSuccess && (
              <button className="button is-primary">
                Einträge hinzufügen / bearbeiten
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
