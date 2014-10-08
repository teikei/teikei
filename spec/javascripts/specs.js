// Ensure helpers are loaded first. Remove the following line if
// helpers directory is not created yet.
//= require_tree ./helpers
//= require_tree ./fixtures/js
//= require_tree ./
//= require application.js
//= require map.js

Teikei.currentUser = new Teikei.Entities.UserSession({
  "name": "Test",
  "phone": "1234",
  "email": "Test",
  "password": "Test"
});
Teikei.start();


