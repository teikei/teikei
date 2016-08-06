Backbone.Form.YesNoCheckbox = Backbone.Form.editors.Checkbox.extend({
  getValue() {
    return editors.Checkbox.prototype.getValue.call(this) ? 'yes' : 'no'
  },
  setValue(value) {
    editors.Checkbox.prototype.setValue.call(this, value === 'yes')
  }
})
