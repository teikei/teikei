/**
 * SELECT2
 *
 * Renders Select2 - jQuery based replacement for select boxes
 *
 * Requires an 'options.values' value on the schema.
 *  Can be an array of options, a function that calls back with the array of options, a string of HTML
 *  or a Backbone collection. If a collection, the models must implement a toString() method
 *
 * Source: https://gist.github.com/Integral/5998949
 */
Backbone.Form.editors.Select2 = Backbone.Form.editors.Base.extend({

  tagName: 'select',

  events: {
    'change': function(event) {
      this.trigger('change', this);
    },
    'focus': function(event) {
      this.trigger('focus', this);
    },
    'blur': function(event) {
      this.trigger('blur', this);
    }
  },

  initialize(options) {
    Backbone.Form.editors.Base.prototype.initialize.call(this, options);

    if (!this.schema || !this.schema.options.values) throw new Error("Missing required 'schema.options.values'");
  },

  render() {
    const self = this;
    this.setOptions(this.schema.options.values);
    if (this.schema.options.multiple) {
      this.$el.attr('multiple', 'multiple');
    }
    setTimeout(() => {
      self.$el.select2({
        width: 'resolve'
      });
    }, 0);

    return this;
  },

  /**
   * Sets the options that populate the <select>
   *
   * @param {Mixed} options
   */
  setOptions(options) {
    const self = this;

    // If a collection was passed, check if it needs fetching
    if (options instanceof Backbone.Collection) {
      const collection = options;

      // Don't do the fetch if it's already populated
      if (collection.length > 0) {
        this.renderOptions(options);
      } else {
        collection.fetch({
          success: function(collection) {
            self.renderOptions(options);
          }
        });
      }
    } else if (_.isFunction(options)) {
      // If a function was passed, run it to get the options

      options(result => {
        self.renderOptions(result);
      }, self);
    } else {
      // Otherwise, ready to go straight to renderOptions
      this.renderOptions(options);
    }
  },

  /**
   * Adds the <option> html to the DOM
   * @param {Mixed}   Options as a simple array e.g. ['option1', 'option2']
   *                      or as an array of objects e.g. [{val: 543, label: 'Title for object 543'}]
   *                      or as a string of <option> HTML to insert into the <select>
   */
  renderOptions(options) {
    const $select = this.$el;
    const html = this._getOptionsHtml(options);

    // Insert options
    $select.html(html);

    // Select correct option
    this.setValue(this.value);
  },

  _getOptionsHtml(options) {
    let html;
    // Accept string of HTML
    if (_.isString(options)) {
      html = options;
    } else if (_.isArray(options)) {
      // Or array
      html = this._arrayToHtml(options);
    } else if (options instanceof Backbone.Collection) {
      // Or Backbone collection
      html = this._collectionToHtml(options);
    } else if (_.isFunction(options)) {
      let newOptions;

      options(opts => {
        newOptions = opts;
      }, this);

      html = this._getOptionsHtml(newOptions);
    }

    return html;
  },

  getValue() {
    return this.$el.val();
  },

  setValue(value) {
    this.$el.val(value);
  },

  focus() {
    if (this.hasFocus) return;

    this.$el.focus();
  },

  blur() {
    if (!this.hasFocus) return;

    this.$el.blur();
  },

  /**
   * Transforms a collection into HTML ready to use in the renderOptions method
   * @param {Backbone.Collection}
   * @return {String}
   */
  _collectionToHtml(collection) {
    // Convert collection to array first
    const array = [];
    collection.each(model => {
      array.push({
        val: model.id,
        label: model.toString()
      });
    });

    // Now convert to HTML
    const html = this._arrayToHtml(array);

    return html;
  },

  /**
   * Create the <option> HTML
   * @param {Array}   Options as a simple array e.g. ['option1', 'option2']
   *                      or as an array of objects e.g. [{val: 543, label: 'Title for object 543'}]
   * @return {String} HTML
   */
  _arrayToHtml(array) {
    const html = [];

    // Generate HTML
    _.each(array, option => {
      if (_.isObject(option)) {
        if (option.group) {
          html.push(`<optgroup label='${option.group}'>`);
          html.push(this._getOptionsHtml(option.options));
          html.push('</optgroup>');
        } else {
          const val = (option.val || option.val === 0) ? option.val : '';
          html.push(`<option value='${val}>${option.label}</option>`);
        }
      } else {
        html.push(`<option>${option}</option>`);
      }
    }, this);

    return html.join('');
  }

});
