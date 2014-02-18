describe("Participate", function() {

  var participateController;

  beforeEach(function () {
    loadFixtures('html/menu.html');
    participateController = Teikei.Participate.Controller;
  });

  describe("ParticipateView", function() {

    xit("should show consumers infos when a 'participate:for:consumers' is fired.", function() {
      // bind callback to participateController.participateView
      // trigger participate:for:consumers
      // expect callback.showConsumerInfos toHaveBeenCalled()
    });

    xit("should show farmers infos when a 'participate:for:farmers' is fired.", function() {
      // bind callback to participateController.participateView
      // trigger participate:for:farmers
      // expect callback.showFarmerInfos toHaveBeenCalled()
    });

    xit("should fire 'first:tab:click' when consumers tab is clicked.", function() {
      // var callback = jasmine.createSpy();
      // participateController.participateView.bind("first:tab:click", callback, this);
      // $("#consumers-tab").trigger("click");
      // expect(callback).toHaveBeenCalled();
    });

    xit("should fire 'second:tab:click' when farmers tab is clicked.", function() {
      // var callback = jasmine.createSpy();
      // participateController.participateView.bind("second:tab:click", callback, this);
      // $("#farmers-tab").trigger("click");
      // expect(callback).toHaveBeenCalled();
    });

    xit("should show consumers infos when a 'first:tab:click' is fired.", function() {
      // bind callback to participateController.participateView
      // trigger first:tab:click
      // expect callback.showConsumerInfos toHaveBeenCalled()
    });

    xit("should show farmers infos when a 'second:tab:click' is fired.", function() {
      // bind callback to participateController.participateView
      // trigger second:tab:click
      // expect callback.showFarmerInfos toHaveBeenCalled()
    });

  });

  describe("ParticipateView", function() {

    beforeEach(function() {
      // Mock the $.ajax function to prevent XHR:
      spyOn($, "ajax").andCallFake(function(params) {});
    });

    it("should be presented in a modal view.", function() {
      var participateView = new Teikei.Participate.ParticipateView();
      expect(participateView.$el).toHaveClass("reveal-modal");
    });

  });

});
