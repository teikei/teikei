$("#nav-switch").on("click", function(event) {
  navigationClassName = 'show-navigation';

  event.preventDefault();
  event.stopPropagation();

  $('body').toggleClass(navigationClassName);

  // Close navigation slider when the user clicks ouside of the navigation:
  $(document).one("click", function() {
    $('body').removeClass(navigationClassName);
  });

  // Prevent closing of navigation slider when a normal nav-item is clicked:
  $("#navigation").one("click", function(event) {
    event.stopPropagation();
  });

  // Still close the navigation slider when a nav item from the user menu is clicked:
  // (the items from the entries trigger actions in the SPA, not actual navigation)
  $("#navigation").one("click", "#entries-nav, #signin", function() {
    $('body').removeClass(navigationClassName);
  });
});
