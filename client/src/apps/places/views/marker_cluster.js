const BASE_DIAMETER = 70
const FACTOR = 1.1

Places.MarkerCluster = Marionette.ItemView.extend({

  template: 'places/marker_cluster',

  initialize(options) {
    const models = _.pluck(options.markers, 'model')
    const counters = _.countBy(models, model => {
      return model.get('type').toLowerCase()
    })

    this.model = new Backbone.Model({
      farms: counters.farm,
      depots: counters.depot,
      sum: models.length
    })

    this.render()
  },

  getLeafletIcon() {
    const sum = this.model.get('sum')
    const diameter = sum * FACTOR + BASE_DIAMETER

    return L.divIcon({
      html: this.el.innerHTML,
      className: 'cluster',
      iconSize: L.point(diameter, diameter)
    })
  }

})
