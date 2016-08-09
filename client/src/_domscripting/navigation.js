$("#nav-switch").on("click", (event) => {
  const NAV_CLASS_NAME = 'show-navigation';

  event.preventDefault();
  event.stopPropagation();

  $('body').toggleClass(NAV_CLASS_NAME);

  // Close navigation slider when the user clicks ouside of the navigation:
  $(document).one("click", () => {
    $('body').removeClass(NAV_CLASS_NAME);
  });

  // Prevent closing of navigation slider when a normal nav-item is clicked:
  $("#navigation").one("click", (event) => {
    event.stopPropagation();
  });

  // Still close the navigation slider when a nav item from the user menu is clicked:
  // (the items from the entries trigger actions in the SPA, not actual navigation)
  $("#navigation").one("click", "#entries-nav, #signin", () => {
    $('body').removeClass(NAV_CLASS_NAME);
  });
});
