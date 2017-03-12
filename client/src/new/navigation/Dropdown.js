import React from 'react'
import onClickOutside from 'react-onclickoutside'
import classNames from 'classnames'

const DropdownMenu = component => (
  <div className="dropdown-menu">
    { component }
  </div>
)

class Dropdown extends React.Component {

  constructor(props) {
    super(props);
    this.className = classNames(props.className, Dropdown.defaultProps.className)
    this.state = { toggleMenu: false }
  }

  handleClickOutside = () => {
    this.setState({
      isActive: false,
    })
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
      { this.state.isActive && DropdownMenu(this.props.menuComponent) }
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

export default onClickOutside(Dropdown)
