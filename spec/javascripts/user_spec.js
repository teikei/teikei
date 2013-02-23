describe("User", function() {

  var userController;

  beforeEach(function () {
    loadFixtures('menu.html');
    userController = new Teikei.User.Controller();
  });

  afterEach(function () {
    userController = new Teikei.User.Controller();
  });

  it("should contain a model.", function() {
    expect(userController.model).toBeDefined();
  });

  it("should contain a MenuView.", function() {
    expect(userController.menuView).toBeDefined();
  });

  it("should contain a LoginView.", function() {
    expect(userController.loginView).toBeDefined();
  });

  describe("MenuView", function() {

    it("should fire a 'login:selected' event when the login link is clicked.", function() {
      var callback = jasmine.createSpy();
      userController.menuView.bind("login:selected", callback, this);
      $("#login").trigger("click");

      expect(callback).toHaveBeenCalled();
    });

    it("should fire a 'logout:selected' event when the logout link is clicked.", function() {
      var callback = jasmine.createSpy();
      userController.menuView.bind("logout:selected", callback, this);
      userController.model.set("loggedIn", true);
      $("#login").trigger("click");

      expect(callback).toHaveBeenCalled();
    });

    it("should toggle the login/logout link to 'logout' once the user is logged in.", function() {
      Teikei.vent.trigger("user:login:success");
      expect($("#login")).toHaveText("Abmelden");
    });

    it("should toggle the login/logout link to 'login' once the user is logged in.", function() {
      Teikei.vent.trigger("user:logout:success");
      expect($("#login")).toHaveText("Anmelden");
    });

  });

  describe("LoginView", function() {

    beforeEach(function() {
      // Mock the $.ajax function to prevent XHR:
      spyOn($, "ajax").andCallFake(function(params) {})
    })

    it("should contain a form.", function() {
      expect(userController.loginView.$el).toContain("form");
    });

    it("should contain input fields for username and password.", function() {
      expect(userController.loginView.$el).toContain("input[type='text']#email");
      expect(userController.loginView.$el).toContain("input[type='password']#password");
    });

    it("should be presented in a modal view.", function() {
      expect(userController.loginView.$el).toHaveClass("reveal-modal");
    });

    it("should fire a 'form:submit' event when the form is submitted.", function() {
      var callback = jasmine.createSpy("FormSubmitSpy");

      userController.loginView.bind("form:submit", callback, this);
      userController.loginView.ui.form.trigger("submit");

      expect(callback).toHaveBeenCalled();
    });

    it("should pass username and password with the 'form:submit' event.", function() {
      var email = "firstname.name@email.com";
      var password = "Passw0rd";
      var callback = jasmine.createSpy("FormSubmitSpy");

      userController.loginView.$el.find("#email").val(email)
      userController.loginView.$el.find("#password").val(password)
      userController.loginView.bind("form:submit", callback, this);
      userController.loginView.ui.form.trigger("submit");

      expect(callback).toHaveBeenCalledWith({
        email: email,
        password: password
      });
    });

    it("should close the modal view when the login was successful.", function() {
      spyOn(userController.loginView.$el, "trigger");
      Teikei.vent.trigger("user:login:success");
      expect(userController.loginView.$el.trigger).toHaveBeenCalledWith("reveal:close");
    });

  });

});
