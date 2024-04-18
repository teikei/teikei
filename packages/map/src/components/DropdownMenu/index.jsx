import React from 'react'
import PropTypes from 'prop-types'
import onClickOutside from 'react-onclickoutside'
import classNames from 'classnames'

const DropdownMenu = (component, onCloseClick) => (
  <div className='dropdown-menu'>
    <button
      className='dropdown-menu-backdrop'
      onClick={onCloseClick}
      aria-label='Close'
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

  handleToggleMenu = () => {
    this.setState({
      isActive: !this.state.isActive
    })
  }

  render = () => (
    <div className={this.className} onClick={this.handleToggleMenu}>
      <button
        className={this.props.labelClassName}
        onClick={this.handleToggleMenu}
      >
        {this.props.label}
      </button>
      {this.state.isActive &&
        DropdownMenu(this.props.menuComponent, this.handleToggleMenu)}
    </div>
  )
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
