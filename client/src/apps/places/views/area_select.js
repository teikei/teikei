Places.AreaSelectView = Base.ItemView.extend({

  tagName: 'form',

  template: 'places/area_select',

  ui: {
    areaSelect: '#area-select'
  },

  events: {
    'change #area-select': 'selectArea'
  },

  initialize(options) {
    this.areas = options.areas
  },

  onRender() {
    this.initializeSelectHtml()
  },

  selectArea(event) {
    const areaName = this.parseAreaName(event)
    this.trigger('select:area', areaName)
  },

  setOption(optionValue) {
    this.ui.areaSelect.val(optionValue)
  },

  initializeSelectHtml() {
    const optionsHtml = _.map(this.areas, this.getOptionHtml)
    this.ui.areaSelect.html(optionsHtml)
  },

  getOptionHtml(area, key) {
    return $('<option/>', {
      value: key,
      text: area.displayName
    })
  },

  parseAreaName(event) {
    const options = event.currentTarget.options
    const index = options.selectedIndex
    return options.item(index).value
  }

})
