// backbone-form i18n

Backbone.Form.editors.Date.monthNames = [
  I18n.t('months.january'),
  I18n.t('months.february'),
  I18n.t('months.march'),
  I18n.t('months.april'),
  I18n.t('months.may'),
  I18n.t('months.june'),
  I18n.t('months.july'),
  I18n.t('months.august'),
  I18n.t('months.september'),
  I18n.t('months.october'),
  I18n.t('months.november'),
  I18n.t('months.december')
];

Backbone.Form.validators.errMessages = {
  required: I18n.t('forms.validation.required'),
  regexp: I18n.t('forms.validation.regexp'),
  email: I18n.t('forms.validation.email'),
  url: I18n.t('forms.validation.url'),
  integer: I18n.t('forms.validation.integer'),
  match: I18n.t('forms.validation.match'),
  minlength: _.template(I18n.t('forms.validation.minlength'), null, Backbone.Form.templateSettings),
  selectionrequired: I18n.t('forms.validation.selectionrequired'),
  phonenumber: I18n.t('forms.validation.phonenumber')
};

// Overwriting Backbone.Marionette.Renderer to use JST
Backbone.Marionette.Renderer.render = function(template, data) {
  if (!JST[template]) throw "Template '" + template + "' not found!";
  return JST[template](data);
};

Teikei = new Backbone.Marionette.Application();

Teikei.labels = {
  vegetable_products: [
    {label: I18n.t('products.vegetables'), val: "vegetables"},
    {label: I18n.t('products.fruits'), val: "fruits"},
    {label: I18n.t('products.mushrooms'), val: "mushrooms"},
    {label: I18n.t('products.cereals'), val: "cereals"},
    {label: I18n.t('products.bread_and_pastries'), val: "bread_and_pastries"},
    {label: I18n.t('products.spices'), val: "spices"}
  ],
  animal_products: [
    {label: I18n.t('products.eggs'), val: "eggs"},
    {label: I18n.t('products.meat'), val: "meat"},
    {label: I18n.t('products.sausages'), val: "sausages"},
    {label: I18n.t('products.milk'), val: "milk"},
    {label: I18n.t('products.dairy'), val: "dairy"},
    {label: I18n.t('products.fish'), val: "fish"},
    {label: I18n.t('products.honey'), val: "honey"}
  ],
  beverages: [
    {label: I18n.t('products.juice'), val: "juice"},
    {label: I18n.t('products.wine'), val: "wine"},
    {label: I18n.t('products.beer'), val: "beer"}
  ]
};

Teikei.addInitializer(function(options) {
  Teikei.addRegions({
    modalRegion: Teikei.Base.ModalRegion,
    alertRegion: Teikei.Base.AlertRegion,
    controlsRegion: "#controls-container"
  });
});

Teikei.on("initialize:after", function(options) {
  if (Backbone.history) {
    Backbone.history.start();
  }
});

