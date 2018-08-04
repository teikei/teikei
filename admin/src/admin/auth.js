import { login as loginConnector } from './connectors'

const login = {
  // path: 'login', // optional
  // title: 'Login', // optional
  actions: {
    login(req) {
      return loginConnector.create(req)
    }
  }
}

login.fields = [
  {
    name: 'email',
    label: 'Username',
    field: 'Text'
  },
  {
    name: 'password',
    label: 'Password',
    field: 'Password'
  }
]

const logout = undefined

export default {
  login,
  logout
}
