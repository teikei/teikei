import React from 'react'
import classNames from 'classnames'

class Dropdown extends React.Component {

  constructor(props) {
    super(props);
    this.className = classNames(props.className, Dropdown.defaultProps.className)
    this.state = { toggleMenu: false }
  }

  toggleMenu = () => {
    this.setState({
      isActive: !this.state.isActive,
    })
  }

  render = () => (
    <div className={this.className}>
      <button className={this.props.labelClassName} onClick={this.toggleMenu}>
        {this.props.label}
      </button>
      { this.state.isActive && (
        <div className="dropdown-menu">
          { this.props.menuComponent }
        </div>
      )}
    </div>
  )
}

Dropdown.defaultProps = {
  className: 'dropdown',
}

Dropdown.propTypes = {
  className: React.PropTypes.string,
  label: React.PropTypes.string.isRequired,
  labelClassName: React.PropTypes.string.isRequired,
  menuComponent: React.PropTypes.element.isRequired,
}

export default Dropdown
