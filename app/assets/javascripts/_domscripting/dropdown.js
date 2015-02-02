$("body").on("click", "[data-dropdown-target]", function(event) {
  event.preventDefault();
  event.stopPropagation();
  dropdownSelector = event.currentTarget.getAttribute("data-dropdown-target");
  $dropdown = $(dropdownSelector);
  $dropdown.toggleClass("open");
  $(document).one("click", function(){
    $(".dropdown").removeClass("open");
  });
});
