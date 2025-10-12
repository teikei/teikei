/* eslint no-use-before-define: ["error", { "variables": false }] */

const openClassName = 'show-navigation'

if (typeof document !== 'undefined') {
  const body = document.body
  const navSwitch = document.getElementById('nav-switch')

  if (body && navSwitch) {
    const hideNav = (event: MouseEvent) => {
      event.preventDefault()
      navSwitch.removeEventListener('click', hideNav)
      navSwitch.addEventListener('click', showNav)
      body.removeEventListener('click', hideNav)
      body.classList.remove(openClassName)
    }

    const showNav = (event: MouseEvent) => {
      event.preventDefault()
      event.stopPropagation()
      navSwitch.addEventListener('click', hideNav)
      body.addEventListener('click', hideNav)
      body.classList.add(openClassName)
    }

    navSwitch.addEventListener('click', showNav)
  }
}
