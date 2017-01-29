// this file initializes backbone, marionette and JST templates
// and the global variables Backbone and Teikei.
//
// They are separated from the mpn build in the /client directory
// because we experienced npm loading issues with them and were forced
// to use npm 2, which in turn led to memory leaks and a very slow build
// process.
//
// As soon as we have moved to React completely, this file can be removed
// along with the gems 'backbone-on-rails', 'marionette-rails' and 'underscore'.

//= require underscore
//= require backbone
//= require backbone.marionette
//= require_tree ../templates

Backbone.Marionette = Marionette
// Overwriting Backbone.Marionette.Renderer to use JST
Backbone.Marionette.Renderer.render = function (template, data) {
  if (!JST[template]) throw new Error('Template ' + template + ' not found!')
  return JST[template](data)
}

Teikei = new Backbone.Marionette.Application()
