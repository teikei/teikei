describe("User", function() {

  var userController;

  beforeEach(function () {
    loadFixtures('html/menu.html');
    userController = new Teikei.User.Controller();
  });

  it("should contain a model.", function() {
    expect(userController.model).toBeInstanceOf(Teikei.User.Model);
  });

  it("should contain a MenuView.", function() {
    expect(userController.menuView).toBeInstanceOf(Teikei.User.MenuView);
  });

  describe("MenuView", function() {

    xit("should fire a 'participate:for:consumers' event when the 'for consumers' item is clicked.", function() {
      // bind callback to participate:for:consumers
      // trigger click on #participate-depot in menuView
      // expect callback toHaveBeenCalled()
    });

    xit("should fire a 'participate:for:farmers' event when the 'for farmers' item is clicked.", function() {
      // bind callback to participate:for:farmers
      // trigger click on #participate-farm in menuView
      // expect callback toHaveBeenCalled()
    });

    it("should fire a 'signin:selected' event when the signin link is clicked.", function() {
      var callback = jasmine.createSpy();
      userController.menuView.bind("signin:selected", callback, this);
      spyOn(userController.model, "tokenIsPresent").andCallFake(function(params) {
        return false;
      });
      $("#signin").trigger("click");

      expect(callback).toHaveBeenCalled();
    });

    it("should fire a 'logout:selected' event when the logout link is clicked.", function() {
      var callback = jasmine.createSpy();
      userController.menuView.bind("logout:selected", callback, this);
      spyOn(userController.model, "tokenIsPresent").andCallFake(function(params) {
        return true;
      });
      $("#signout").trigger("click");

      expect(callback).toHaveBeenCalled();
    });

    xit("should show the 'new entry' menu item once the user is signed in.", function() {
      Teikei.vent.trigger("user:signin:success");
      _.defer(function() {
        expect($("#participate")).toBeHidden();
        expect($("#new-entry")).toBeVisible();
      });
    });

    xit("should show the 'participate' menu item once the user is signed out.", function() {
      Teikei.vent.trigger("user:logout:success");
      _.defer(function() {
        expect($("#new-entry")).toBeHidden();
        expect($("#participate")).toBeVisible();
      });
    });

    it("should toggle the login/logout link to 'login' once the user is logged in.", function() {
      spyOn(userController.model, "tokenIsPresent").andCallFake(function(params) {
        return false;
      });
      Teikei.vent.trigger("user:logout:success");
      expect($("#signin")).toBeVisible();
      expect($("#signout")).toBeHidden();
    });

    it("should show the name of the user currently signed in.", function() {
      userName = "John Doe";

      userController.model = new Teikei.User.Model(userController);
      userController.menuView = new Teikei.User.MenuView(userController);

      userController.model.set("name", userName);
      spyOn(userController.model, "tokenIsPresent").andCallFake(function(params) {
        return true;
      });
      Teikei.vent.trigger("user:signin:success", userController.model);
      expect(userController.menuView.$el.find("#user-name")).toHaveText(userName);
      expect(userController.menuView.$el.find("#user-name")).toBeVisible();
    });

    it("should not show any name if no user is signed in.", function() {
      userName = "John Doe";

      userController.model = new Teikei.User.Model(userController);
      userController.menuView = new Teikei.User.MenuView(userController);

      userController.model.set("name", userName);
      spyOn(userController.model, "tokenIsPresent").andCallFake(function(params) {
        return false;
      });
      userController.logout();
      expect(userController.menuView.$el.find("#user-name")).toHaveText("");
      expect(userController.menuView.$el.find("#user-name")).toBeHidden();
    });

  });

  describe("LoginView", function() {

    beforeEach(function() {
      userController.initializeLoginView();
      // Mock the $.ajax function to prevent XHR:
      spyOn($, "ajax").andCallFake(function(params) {});
      userController.loginView.render();
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
      Teikei.vent.trigger("user:signin:success", userController.model);
      expect(userController.loginView.$el.trigger).toHaveBeenCalledWith("reveal:close");
    });

    it("should close the modal view when the signup was successful.", function() {
      spyOn(userController.loginView.$el, "trigger");
      userController.model.set("user", {email: "name@email.com"});
      Teikei.vent.trigger("user:signup:success", userController.model);
      expect(userController.loginView.$el.trigger).toHaveBeenCalledWith("reveal:close");
    });

  });

});
