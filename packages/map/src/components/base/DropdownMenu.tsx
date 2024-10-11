import { ReactNode, useRef, useState } from 'react'
import { useOnClickOutside } from 'usehooks-ts'
import classNames from 'classnames'

interface DropdownProps {
  className?: string
  label: string
  labelClassName: string
  menuComponent: ReactNode
}

const DropdownMenu = (component: ReactNode, onCloseClick: () => void) => (
  <div className='dropdown-menu'>
    <button
      className='dropdown-menu-backdrop'
      onClick={onCloseClick}
      aria-label='Close'
    />
    {component}
  </div>
)

const Dropdown = ({
  className,
  label,
  labelClassName,
  menuComponent
}: DropdownProps) => {
  const ref = useRef<HTMLDivElement>(null)
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

export default Dropdown
