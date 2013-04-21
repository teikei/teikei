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
      $("#signin").trigger("click");

      expect(callback).toHaveBeenCalled();
    });

    it("should fire a 'signup:selected' event when the signup link is clicked.", function() {
      var callback = jasmine.createSpy();
      userController.menuView.bind("signup:selected", callback, this);
      $("#signup").trigger("click");

      expect(callback).toHaveBeenCalled();
    });

    it("should fire a 'logout:selected' event when the logout link is clicked.", function() {
      var callback = jasmine.createSpy();
      userController.menuView.bind("logout:selected", callback, this);
      userController.model.set("loggedIn", true);
      $("#signin").trigger("click");

      expect(callback).toHaveBeenCalled();
    });

    it("should show the 'new entry' menu item once the user is signed in.", function() {
      Teikei.vent.trigger("user:signin:success");
      _.defer(function() {
        expect($("#participate")).toBeHidden();
        expect($("#new-entry")).toBeVisible();
      });
    });

    it("should show the 'participate' menu item once the user is signed out.", function() {
      Teikei.vent.trigger("user:logout:success");
      _.defer(function() {
        expect($("#new-entry")).toBeHidden();
        expect($("#participate")).toBeVisible();
      });
    });

    it("should toggle the login/logout link to 'logout' once the user is logged in.", function() {
      Teikei.vent.trigger("user:signin:success");
      expect($("#signin")).toHaveText("Abmelden");
    });

    it("should toggle the login/logout link to 'login' once the user is logged in.", function() {
      Teikei.vent.trigger("user:logout:success");
      expect($("#signin")).toHaveText("Anmelden");
    });

    it("should toggle the 'signup/edit account' link to 'edit account' once the user is signed in.", function() {
      Teikei.vent.trigger("user:signin:success");
      expect($("#signup")).toHaveText("Konto anpassen");
    });

    it("should toggle the 'signup/edit account' link to 'sign-up' once the user is signed out.", function() {
      Teikei.vent.trigger("user:logout:success");
      expect($("#signup")).toHaveText("Registrieren");
    });

    it("should toggle the 'signin/logout' url to '/users/sign_out' once the user is signed in.", function() {
      Teikei.vent.trigger("user:signin:success");
      expect($("#signin").attr("href")).toMatch("/users/sign_out");
    });

    it("should toggle the 'signin/logout' url to '/users/sign_in' once the user is signed out.", function() {
      Teikei.vent.trigger("user:logout:success");
      expect($("#signin").attr("href")).toMatch("/users/sign_in");
    });

    it("should toggle the 'signup/edit account' url to '/users/edit' once the user is signed in.", function() {
      Teikei.vent.trigger("user:signin:success");
      expect($("#signup").attr("href")).toMatch("/users/edit");
    });

    it("should toggle the 'signup/edit account' url to '/users/sign_up' once the user is signed out.", function() {
      Teikei.vent.trigger("user:logout:success");
      expect($("#signup").attr("href")).toMatch("/users/sign_up");
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

    xit("should fire a 'user:signin:success' event when the sign-up form is submitted.", function() {
      // TODO Implementation missing: Submit form with faked parameters, listen for event.
    });

    xit("should fire a 'user:signup:success' event when the sign-up form is submitted.", function() {
      // TODO Implementation missing: Submit form with faked parameters, listen for event.
    });

    it("should submit the filled-out sign-in form when <enter> is pressed.", function() {
      var callback = jasmine.createSpy("FormSubmitSpy");

      // Stub the form validation:
      spyOn(userController.loginView.signInForm, "validate").andCallFake(function(params) {
        return null;
      });

      var event = jQuery.Event("keypress");
      event.which = 13; // Enter key.
      event.keyCode = 13;

      userController.loginView.bind("signInForm:submit", callback, this);
      userController.loginView.$el.find("#signInEmail").trigger(event);
      expect(callback).toHaveBeenCalled();
    });

    it("should submit the filled-out sign-up form when <enter> is pressed.", function() {
      var callback = jasmine.createSpy("FormSubmitSpy");

      // Stub the form validation:
      spyOn(userController.loginView.signUpForm, "validate").andCallFake(function(params) {
        return null;
      });

      var event = jQuery.Event("keypress");
      event.which = 13; // Enter key.
      event.keyCode = 13;

      userController.loginView.bind("signUpForm:submit", callback, this);
      userController.loginView.$el.find("#signUpName").trigger(event);
      expect(callback).toHaveBeenCalled();
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
