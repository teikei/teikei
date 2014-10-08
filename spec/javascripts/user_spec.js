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
      Teikei.currentUser = new Teikei.Entities.UserSession();
      Teikei.User.menuView = new Teikei.User.MenuView({model: Teikei.currentUser});

      var callback = jasmine.createSpy();
      Teikei.User.menuView.bind("signin:selected", callback, this);
      $("#signin").trigger("click");

      expect(callback).toHaveBeenCalled();
    });

    it("should fire a 'logout:selected' event when the logout link is clicked.", function() {
      Teikei.currentUser = new Teikei.Entities.UserSession();
      Teikei.User.menuView = new Teikei.User.MenuView({model: Teikei.currentUser});

      var callback = jasmine.createSpy();
      Teikei.User.menuView.bind("logout:selected", callback, this);
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

    it("should toggle the login/logout link to 'login' once the user is logged out.", function() {
      Teikei.User.menuView = new Teikei.User.MenuView({model: Teikei.currentUser});
      Teikei.currentUser = null;
      Teikei.vent.trigger("user:logout:success");
      expect($("#signin")).toBeVisible();
      expect($("#signout")).toBeHidden();
    });

    it("should show the name of the user currently signed in.", function() {
      userName = "John Doe";

      Teikei.currentUser = new Teikei.Entities.UserSession();
      Teikei.User.menuView = new Teikei.User.MenuView({model: Teikei.currentUser});

      Teikei.currentUser.set("name", userName);
      Teikei.vent.trigger("user:signin:success", Teikei.currentUser);
      expect(Teikei.User.menuView.$el.find("#user-name")).toHaveText(userName);
      expect(Teikei.User.menuView.$el.find("#user-name")).toBeVisible();
    });

    it("should not show any name if no user is signed in.", function() {
      userName = "John Doe";

      Teikei.currentUser = new Teikei.Entities.UserSession();
      Teikei.User.menuView = new Teikei.User.MenuView({model: Teikei.currentUser});

      Teikei.currentUser.set("name", userName);
      userController.logout();
      expect(Teikei.User.menuView.$el.find("#user-name")).toHaveText("");
      expect(Teikei.User.menuView.$el.find("#user-name")).toBeHidden();
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

    it("should be presented in a modal view.", function() {
      expect(Teikei.User.loginView.$el).toHaveClass("reveal-modal");
    });

    xit("should focus the name field of the sign-up form #0", function() {
      var signUpName = Teikei.User.loginView.signUpForm.$el.find("#signUpName");
      Teikei.User.loginView.showSignUpForm();
      expect(document.activeElement).toEqual(signUpName);
    });

    xit("should focus the name field of the sign-up form", function() {
      var signUpName = Teikei.User.loginView.signUpForm.$el.find("#signUpName");
      // spyOn(userController.loginView.signUpForm.$el, "signUpName");
      Teikei.User.loginView.showSignUpForm();
      expect(signUpName).toBeFocused();
      // expect(signUpName.is(":focus")).toBe(true);
    });

    xit("should focus the name field of the sign-up form #2", function() {
      var signUpName = Teikei.User.loginView.signUpForm.$el.find("#signUpName");
      var spyEvent = spyOnEvent(signUpName, 'focus');
      Teikei.User.loginView.showSignUpForm();;
      expect('focus').toHaveBeenTriggeredOn(signUpName);
      expect(spyEvent).toHaveBeenTriggered();
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
