import React from 'react'

class CustomDashboard extends React.Component {
  render() {
    return (
      <div className="mgs-container">
        <div className="mgs-row">
          <div className="box">
            <h3>Welcome</h3>
            <p>
             This is the Teikei administration backend.
            </p>
            <p>
             <a href="/farms">Farms</a>
            </p>
            <p>
              <a href="/depots">Depots</a>
            </p>
            <p>
              <a href="/initiatives">Initiatives</a>
            </p>
          </div>
          <div className="box">
            <h3>Links</h3>
            <ul>
              <li>
                <a href="http://ernte-teilen.org" target="_blank">
                  Ernte Teilen
                </a>
              </li>
              <li>
                <a href="https://github.com/teikei/teikei" target="_blank">
                  Teikei on Github
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    )
  }
}

export default CustomDashboard
