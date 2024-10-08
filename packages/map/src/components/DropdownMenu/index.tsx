import React, { useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { useOnClickOutside } from 'usehooks-ts'
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

const Dropdown = ({ className, label, labelClassName, menuComponent }) => {
  const ref = useRef(null)
  const [isActive, setIsActive] = useState(false)

  const handleClickOutside = () => {
    setIsActive(false)
  }

  const handleToggleMenu = () => {
    setIsActive(!isActive)
  }

  useOnClickOutside(ref, handleClickOutside)

  const combinedClassName = classNames(className, 'dropdown')

  return (
    <div className={combinedClassName} onClick={handleToggleMenu} ref={ref}>
      <button className={labelClassName} onClick={handleToggleMenu}>
        {label}
      </button>
      {isActive && DropdownMenu(menuComponent, handleToggleMenu)}
    </div>
  )
}

Dropdown.propTypes = {
  className: PropTypes.string,
  label: PropTypes.string.isRequired,
  labelClassName: PropTypes.string.isRequired,
  menuComponent: PropTypes.element.isRequired
}

export default Dropdown
