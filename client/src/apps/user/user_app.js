User = {}

require('./views/login')
require('./views/menu')

User.Controller = {

  initializeLoginView() {
    User.loginView = new User.LoginView({
      model: Teikei.currentUser
    })

    User.loginView.bind('signInForm:submit', User.Controller.signIn, User.Controller)
    User.loginView.bind('signUpForm:submit', User.Controller.signUp, User.Controller)
    User.loginView.bind('signin:tab:click', User.Controller.navigateToSignIn, User.Controller)
    User.loginView.bind('signup:tab:click', User.Controller.navigateToSignUp, User.Controller)
  },

  signInPopup() {
    if (!Teikei.currentUser) {
      User.Controller.initializeLoginView()
      Teikei.modalRegion.show(User.loginView)
    }
  },

  signUpPopup() {
    if (!Teikei.currentUser) {
      User.Controller.initializeLoginView()
      Teikei.modalRegion.show(User.loginView)
      User.loginView.showSignUpForm()
    }
  },

  navigateToSignIn() {
    Backbone.history.navigate('signin')
  },

  navigateToSignUp() {
    Backbone.history.navigate('signup')
  },

  signIn(credentials) {
    const user = new Entities.UserSession()
    user.save({ user: credentials }, {
      success(model, response, options) {
        Teikei.currentUser = model
        Teikei.vent.trigger('user:signin:success', Teikei.currentUser)
      },
      error(model, xhr, options) {
        Teikei.vent.trigger('user:signin:fail', xhr)
      }
    })
  },

  signUp(credentials) {
    const signUpData = { user: credentials }

    const userSignup = new Entities.UserSignup()
    userSignup.save(signUpData, {
      success(model, response, options) {
        Teikei.vent.trigger('user:signup:success', model)
      },
      error(model, xhr, options) {
        Teikei.vent.trigger('user:signup:fail', xhr)
      }
    })
  }
}

Teikei.vent.on('show:signup', Teikei.signUpPopup, User.Controller)

User.Router = Backbone.Marionette.AppRouter.extend({
  appRoutes: {
    'signin': 'signInPopup',
    'signup': 'signUpPopup'
  }
})

Teikei.addInitializer(() => {
  User.menuView = new User.MenuView({
    model: Teikei.currentUser
  })

  User.menuView.bind('signin:selected', User.Controller.signInPopup, User.Controller)
  User.menuView.bind('signup:selected', User.Controller.signUpPopup, User.Controller)
})

Teikei.addInitializer(() => {
  new User.Router({
    controller: User.Controller
  })
})
