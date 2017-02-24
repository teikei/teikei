/* eslint no-use-before-define: ["error", { "functions": false }] */

const openClassName = 'show-navigation';
const body = document.body
const navSwitch = document.getElementById('nav-switch')

function hideNav(event) {
  event.preventDefault()
  navSwitch.removeEventListener('click', hideNav)
  navSwitch.addEventListener('click', showNav)
  body.removeEventListener('click', hideNav)
  body.classList.remove(openClassName)
}

function showNav(event) {
  event.preventDefault()
  event.stopPropagation()
  navSwitch.addEventListener('click', hideNav)
  body.addEventListener('click', hideNav)
  body.classList.add(openClassName)
}

if (navSwitch) navSwitch.addEventListener('click', showNav)
