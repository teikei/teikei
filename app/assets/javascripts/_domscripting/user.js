$("#navigation").on("click", "#user-menu-toggle", function(event) {
  event.preventDefault();
  event.stopPropagation();
  $dropdown = $("#user-menu-dropdown");
  $dropdown.toggleClass("open");
  $(document).one("click", function(){
    $dropdown.removeClass("open");
  });
});
