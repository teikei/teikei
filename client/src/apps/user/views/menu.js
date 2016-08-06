User.MenuView = Marionette.ItemView.extend({

  el: '#user-menu',

  template: 'user/menu',

  model: Teikei.currentUser,

  ui: {
    signin: '#signin',
    addFarm: '#add-farm',
    addDepot: '#add-depot',
    myEntries: '#my-entries'
  },

  events: {
    'click @ui.addFarm': 'addFarm',
    'click @ui.addDepot': 'addDepot',
    'click @ui.myEntries': 'showEntryList',
    'click @ui.signin': 'signin'
  },

  templateHelpers() {
    const currentUser = this.model
    return {
      isLoggedIn() {
        return _.isObject(currentUser)
      }
    }
  },

  initialize() {
    this.render()
    Teikei.vent.on('user:signin:success', this.updateLoginState, this)
  },

  updateLoginState(currentUser) {
    this.model = currentUser
    this.render()
  },

  addFarm(event) {
    event.preventDefault()
    Teikei.vent.trigger('user:add:farm')
  },

  addDepot(event) {
    event.preventDefault()
    Teikei.vent.trigger('user:add:depot')
  },

  showEntryList(event) {
    event.preventDefault()
    Teikei.vent.trigger('user:show:entrylist')
  },

  signin(event) {
    event.preventDefault()
    this.trigger('signin:selected')
  }
})
