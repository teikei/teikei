describe("User", function() {

  var userController;

  beforeEach(function () {
    loadFixtures('menu.html');
    userController = new Teikei.User.Controller();
  });

  it("should contain a model.", function() {
    expect(userController.model).toBeInstanceOf(Teikei.User.Model);
  });

  it("should contain a MenuView.", function() {
    expect(userController.menuView).toBeInstanceOf(Teikei.User.MenuView);
  });

  it("should contain a LoginView.", function() {
    expect(userController.loginView).toBeInstanceOf(Teikei.User.LoginView);
  });

  describe("MenuView", function() {

    it("should fire a 'signin:selected' event when the signin link is clicked.", function() {
      var callback = jasmine.createSpy();
      userController.menuView.bind("signin:selected", callback, this);
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
      Teikei.vent.trigger("user:signin:success");
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
      spyOn($, "ajax").andCallFake(function(params) {});
    });

    it("should contain a form.", function() {
      expect(userController.loginView.$el).toContain("form");
    });

    it("should contain input fields for signin: email and password.", function() {
      expect(userController.loginView.$el).toContain("input[type='text']#signInEmail");
      expect(userController.loginView.$el).toContain("input[type='password']#signInPassword");
    });

    it("should contain input fields for signup: name, email and password.", function() {
      expect(userController.loginView.$el).toContain("input[type='text']#signUpName");
      expect(userController.loginView.$el).toContain("input[type='text']#signUpEmail");
      expect(userController.loginView.$el).toContain("input[type='password']#signUpPassword");
    });

    it("should be presented in a modal view.", function() {
      expect(userController.loginView.$el).toHaveClass("reveal-modal");
    });

    it("should fire a 'signInForm:submit' event when the form is submitted.", function() {
      var callback = jasmine.createSpy("FormSubmitSpy");

      // Stub the form validation:
      spyOn(userController.loginView.signInForm, "validate").andCallFake(function(params) {
        return null;
      });

      userController.loginView.bind("signInForm:submit", callback, this);
      userController.loginView.ui.signInForm.trigger("submit");

      expect(callback).toHaveBeenCalled();
    });

    it("should fire a 'signUpForm:submit' event when the form is submitted.", function() {
      var callback = jasmine.createSpy("FormSubmitSpy");

      // Stub the form validation:
      spyOn(userController.loginView.signUpForm, "validate").andCallFake(function(params) {
        return null;
      });

      userController.loginView.bind("signUpForm:submit", callback, this);
      userController.loginView.ui.signUpForm.trigger("submit");

      expect(callback).toHaveBeenCalled();
    });

    it("should pass email and password with the 'signInForm:submit' event.", function() {
      var email = "firstname.name@email.com";
      var password = "Passw0rd";
      var callback = jasmine.createSpy("FormSubmitSpy");

      userController.loginView.$el.find("#signInEmail").val(email);
      userController.loginView.$el.find("#signInPassword").val(password);
      userController.loginView.bind("signInForm:submit", callback, this);
      userController.loginView.ui.signInForm.trigger("submit");

      expect(callback).toHaveBeenCalledWith({
        email: email,
        password: password
      });
    });

    it("should close the modal view when the signin was successful.", function() {
      spyOn(userController.loginView.$el, "trigger");
      Teikei.vent.trigger("user:signin:success");
      expect(userController.loginView.$el.trigger).toHaveBeenCalledWith("reveal:close");
    });

    it("should close the modal view when the signup was successful.", function() {
      spyOn(userController.loginView.$el, "trigger");
      Teikei.vent.trigger("user:signup:success");
      expect(userController.loginView.$el.trigger).toHaveBeenCalledWith("reveal:close");
    });

  });

});
