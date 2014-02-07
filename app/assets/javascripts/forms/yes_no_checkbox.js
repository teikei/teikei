Backbone.Form.YesNoCheckbox = Backbone.Form.editors.Checkbox.extend({
  getValue: function() {
    return editors.Checkbox.prototype.getValue.call(this) ? "yes" : "no";
  },
  setValue: function(value) {
    editors.Checkbox.prototype.setValue.call(this, value === "yes");
  }
});

