Places = {}

const DEFAULT_BOUNDS = [[47.2703, 5.8667], [54.0585, 15.0419]]

require('./views/delete_entry')
require('./views/details')
require('./views/details_message_form')
require('./views/entry')
require('./views/entry_depot')
require('./views/entry_farm')
require('./views/map')
require('./views/map_config')
require('./views/map_item')
require('./views/marker_cluster')
require('./views/marker_icon')

Places.Controller = {

  placeAdded(place) {
    Places.collection.add(place, { merge: true })
  },

  refreshCollection() {
    Places.collection.fetch({ reset: true, async: false })
  },

  updateMap() {
    Places.mapView.updateMap()
  },

  editEntryById(id) {
    const model = Places.collection.get(id)
    Places.Controller.editEntry(model)
  },

  editEntry(model) {
    const showEntryForm = this.showEntryForm
    model.fetch({
      success(model, response, options) {
        const type = model.get('type')
        Backbone.history.navigate(`places/${model.id}/edit`)
        if (type === 'Farm') {
          showEntryForm(
            Places.EntryFarmView,
            'Angaben zum Betrieb editieren',
            model,
            model.collection
          )
        } else if (type === 'Depot') {
          showEntryForm(
            Places.EntryDepotView,
            'Angaben zur Gruppe editieren',
            model,
            model.collection
          )
        }
      }
    })
  },

  deleteEntry(model) {
    Places.deleteEntryView = new Places.DeleteEntryView({ model })
    Teikei.modalRegion.show(Places.deleteEntryView)
  },

  submitPlaceMessage(data) {
    const model = Places.placeMessage
    model.save(data, {
      success(model, response, options) {
        let message = model.get('message')
        if (message === undefined) {
          message = 'Deine Nachricht wurde erfolgreich versandt.'
        }
        Teikei.vent.trigger('place:message:success', message)
      },
      error(model, xhr, options) {
        Teikei.vent.trigger('place:message:failure', xhr)
      }
    })
  },

  showEntryDepotForm() {
    Backbone.history.navigate('places/new/depot')
    Places.Controller.showEntryForm(
      Places.EntryDepotView,
      'Neues Depot eintragen',
      new Entities.Place(),
      this.collection
    )
  },

  showEntryFarmForm() {
    Backbone.history.navigate('places/new/farm')
    Places.Controller.showEntryForm(
      Places.EntryFarmView,
      'Neuen Betrieb eintragen',
      new Entities.Place(),
      this.collection
    )
  },

  showEntryForm(EntryView, headline, model, collection) {
    Places.entryView = new EntryView({
      model,
      collection,
      headline
    })

    Teikei.modalRegion.show(Places.entryView)
  },

  showTip(id) {
    Places.mapView.showTip(id)
  },

  showDetails(id) {
    Backbone.history.navigate(`places/${id}/details`)
    const model = Places.collection.get(id)
    let detailsView = new Places.DetailsMessageFormView({ model })
    detailsView.bind('placeMessageForm:submit', Places.Controller.submitPlaceMessage, this)
    model.fetch({
      success() {
        Teikei.modalRegion.show(detailsView)
      }
    })
    Places.detailsView = detailsView
  },

  showNetwork(id) {
    Backbone.history.navigate(`places/${id}/network`)
    const model = Places.collection.get(id)
    model.fetch({
      reset: true,
      success() {
        Places.mapView.hilightNetwork(model)
      }
    })
  }
}

Teikei.vent.on('user:add:depot', Places.Controller.showEntryDepotForm, Places.Controller)
Teikei.vent.on('user:add:farm', Places.Controller.showEntryFarmForm, Places.Controller)
Teikei.vent.on('user:show:entrylist', Places.Controller.showEntryList, Places.Controller)

Teikei.vent.on('edit:entry', Places.Controller.editEntry, Places.Controller)
Teikei.vent.on('delete:entry', Places.Controller.deleteEntry, Places.Controller)

Teikei.vent.on('place:deleted', Places.Controller.updateMap, Places.Controller)
Teikei.vent.on('place:added', Places.Controller.placeAdded, Places.Controller)

Teikei.addInitializer(() => {
  Places.placeMessage = new Entities.PlaceMessage()
  Places.collection = new Entities.Places()
  Places.collection.bind('reset', collection => {
    Teikei.vent.trigger('places:change', collection)
  })

  Places.mapView = new Places.MapView({
    collection: Places.collection,
    defaultBounds: DEFAULT_BOUNDS
  })

  Places.mapView.bind('select:details', Places.Controller.showDetails, this)
  Places.mapView.bind('select:network', Places.Controller.showNetwork, this)

  Places.Controller.refreshCollection()
})

Places.Router = Backbone.Marionette.AppRouter.extend({
  controller: Places.Controller,

  appRoutes: {
    'places/:id/tip': 'showTip',
    'places/:id/network': 'showNetwork',
    'places/:id/details': 'showDetails',
    'places/new/farm': 'showEntryFarmForm',
    'places/new/depot': 'showEntryDepotForm',
    'places/:id/edit': 'editEntryById'
  }
})

Teikei.addInitializer(() => {
  new Places.Router({
    controller: Places.Controller
  })
})
