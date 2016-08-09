$("body").on("click", "[data-dropdown-target]", (event) => {
  event.preventDefault();
  event.stopPropagation();
  const dropdownSelector = event.currentTarget.getAttribute("data-dropdown-target");
  const $dropdown = $(dropdownSelector);
  $dropdown.toggleClass("open");
  $(document).one("click", () => {
    $(".dropdown").removeClass("open");
  });
});
