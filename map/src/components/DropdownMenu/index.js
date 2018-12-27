/* eslint no-use-before-define: ["error", { "functions": false }] */

import React from 'react'
import PropTypes from 'prop-types'
import onClickOutside from 'react-onclickoutside'
import classNames from 'classnames'

const DropdownMenu = (component, onCloseClick) => (
  <div className="dropdown-menu">
    <button
      className="dropdown-menu-backdrop"
      onClick={onCloseClick}
      aria-label="Close"
      type="button"
    />
    {component}
  </div>
)

class Dropdown extends React.Component {
  constructor(props) {
    super(props)
    this.className = classNames(
      props.className,
      Dropdown.defaultProps.className
    )
    this.state = { toggleMenu: false }
  }

  handleClickOutside = () => {
    this.setState({
      isActive: false
    })
  }

  toggleMenu = () => {
    this.setState({
      isActive: !this.state.isActive
    })
  }

  render = () => {
    const { labelClassName, label, menuComponent } = this.props
    return (
      /* eslint-disable jsx-a11y/no-static-element-interactions */
      <div className={this.className} onClick={this.toggleMenu}>
        <button
          className={labelClassName}
          onClick={this.toggleMenu}
          type="button"
        >
          {label}
        </button>
        {this.state.isActive && DropdownMenu(menuComponent, this.toggleMenu)}
      </div>
    )
  }
}

Dropdown.defaultProps = {
  className: 'dropdown'
}

Dropdown.propTypes = {
  className: PropTypes.string,
  label: PropTypes.string.isRequired,
  labelClassName: PropTypes.string.isRequired,
  menuComponent: PropTypes.element.isRequired
}

export default onClickOutside(Dropdown)
