describe("User", function() {

  var userController;

  beforeEach(function () {
    loadFixtures('html/menu.html');
    userController = Teikei.User.Controller;
  });

  it("should contain a model.", function() {
    expect(Teikei.currentUser).toBeInstanceOf(Teikei.Entities.UserSession);
  });

  it("should contain a MenuView.", function() {
    expect(Teikei.User.menuView).toBeInstanceOf(Teikei.User.MenuView);
  });

  describe("MenuView", function() {

    it("should fire a 'signin:selected' event when the signin link is clicked.", function() {
      menuView = new Teikei.User.MenuView();
      menuView.render();

      var callback = jasmine.createSpy();
      menuView.bind("signin:selected", callback, this);
      menuView.ui.signin.trigger("click");

      expect(callback).toHaveBeenCalled();
    });

    it("should show the name of the user currently signed in.", function() {
      userName = "John Doe";

      Teikei.currentUser = new Teikei.Entities.UserSession();
      Teikei.User.menuView = new Teikei.User.MenuView({model: Teikei.currentUser});

      Teikei.currentUser.set("name", userName);
      Teikei.vent.trigger("user:signin:success", Teikei.currentUser);
      expect(Teikei.User.menuView.$el.find("#user-menu-toggle")).toHaveText(userName);
      expect(Teikei.User.menuView.$el.find("#user-menu-toggle")).toBeVisible();
    });
  });

  describe("LoginView", function() {

    beforeEach(function() {
      userController.initializeLoginView();
      // Mock the $.ajax function to prevent XHR:
      spyOn($, "ajax").andCallFake(function(params) {});
      Teikei.User.loginView.render();
    });

    it("should contain a form.", function() {
      expect(Teikei.User.loginView.$el).toContain("form");
    });

    it("should contain input fields for signin: email and password.", function() {
      expect(Teikei.User.loginView.$el).toContain("input[type='text']#signInEmail");
      expect(Teikei.User.loginView.$el).toContain("input[type='password']#signInPassword");
    });

    it("should contain input fields for signup: name, email and password.", function() {
      expect(Teikei.User.loginView.$el).toContain("input[type='text']#signUpName");
      expect(Teikei.User.loginView.$el).toContain("input[type='text']#signUpEmail");
      expect(Teikei.User.loginView.$el).toContain("input[type='password']#signUpPassword");
    });

    it("should submit the filled-out sign-in form when <enter> is pressed.", function() {
      var callback = jasmine.createSpy("FormSubmitSpy");

      // Stub the form validation:
      spyOn(Teikei.User.loginView.signInForm, "validate").andCallFake(function(params) {
        return null;
      });

      var event = jQuery.Event("keypress");
      event.which = 13; // Enter key.
      event.keyCode = 13;

      Teikei.User.loginView.bind("signInForm:submit", callback, this);
      Teikei.User.loginView.$el.find("#signInEmail").trigger(event);
      expect(callback).toHaveBeenCalled();
    });

    it("should submit the filled-out sign-up form when <enter> is pressed.", function() {
      var callback = jasmine.createSpy("FormSubmitSpy");

      // Stub the form validation:
      spyOn(Teikei.User.loginView.signUpForm, "validate").andCallFake(function(params) {
        return null;
      });

      var event = jQuery.Event("keypress");
      event.which = 13; // Enter key.
      event.keyCode = 13;

      Teikei.User.loginView.bind("signUpForm:submit", callback, this);
      Teikei.User.loginView.$el.find("#signUpName").trigger(event);
      expect(callback).toHaveBeenCalled();
    });

    it("should fire a 'signInForm:submit' event when the form is submitted.", function() {
      var callback = jasmine.createSpy("FormSubmitSpy");

      // Stub the form validation:
      spyOn(Teikei.User.loginView.signInForm, "validate").andCallFake(function(params) {
        return null;
      });

      Teikei.User.loginView.bind("signInForm:submit", callback, this);
      Teikei.User.loginView.ui.signInForm.trigger("submit");

      expect(callback).toHaveBeenCalled();
    });

    it("should fire a 'signUpForm:submit' event when the form is submitted.", function() {
      var callback = jasmine.createSpy("FormSubmitSpy");

      // Stub the form validation:
      spyOn(Teikei.User.loginView.signUpForm, "validate").andCallFake(function(params) {
        return null;
      });

      Teikei.User.loginView.bind("signUpForm:submit", callback, this);
      Teikei.User.loginView.ui.signUpForm.trigger("submit");

      expect(callback).toHaveBeenCalled();
    });

    it("should pass email and password with the 'signInForm:submit' event.", function() {
      var email = "firstname.name@email.com";
      var password = "Passw0rd";
      var callback = jasmine.createSpy("FormSubmitSpy");

      Teikei.User.loginView.$el.find("#signInEmail").val(email);
      Teikei.User.loginView.$el.find("#signInPassword").val(password);
      Teikei.User.loginView.bind("signInForm:submit", callback, this);
      Teikei.User.loginView.ui.signInForm.trigger("submit");

      expect(callback).toHaveBeenCalledWith({
        email: email,
        password: password
      });
    });

    it("should close the modal view when the signin was successful.", function() {
      spyOn(Teikei.User.loginView.$el, "trigger");
      Teikei.currentUser = new Teikei.Entities.UserSession({
        "name": "Test",
        "phone": "1234",
        "email": "Test",
        "password": "Test"
      });
      Teikei.vent.trigger("user:signin:success", Teikei.currentUser);
      expect(Teikei.User.loginView.$el.trigger).toHaveBeenCalledWith("reveal:close");
    });

    it("should close the modal view when the signup was successful.", function() {
      spyOn(Teikei.User.loginView.$el, "trigger");
      Teikei.currentUser = new Teikei.Entities.UserSession({
        "name": "Test",
        "phone": "1234",
        "email": "Test",
        "password": "Test"
      });
      Teikei.vent.trigger("user:signup:success", Teikei.currentUser);
      expect(Teikei.User.loginView.$el.trigger).toHaveBeenCalledWith("reveal:close");
    });

  });

});
