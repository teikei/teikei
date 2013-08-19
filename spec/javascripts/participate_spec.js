describe("Participate", function() {

  var participateController;

  beforeEach(function () {
    loadFixtures('html/menu.html');
    participateController = new Teikei.Participate.Controller();
  });

  it("should contain a ParticipateView.", function() {
    expect(participateController.participateView).toBeInstanceOf(Teikei.Participate.ParticipateView);
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

    xit("should fire 'consumers:tab:click' when consumers tab is clicked.", function() {
      // var callback = jasmine.createSpy();
      // participateController.participateView.bind("consumers:tab:click", callback, this);
      // $("#consumers-tab").trigger("click");
      // expect(callback).toHaveBeenCalled();
    });

    xit("should fire 'farmers:tab:click' when farmers tab is clicked.", function() {
      // var callback = jasmine.createSpy();
      // participateController.participateView.bind("farmers:tab:click", callback, this);
      // $("#farmers-tab").trigger("click");
      // expect(callback).toHaveBeenCalled();
    });

    xit("should show consumers infos when a 'consumers:tab:click' is fired.", function() {
      // bind callback to participateController.participateView
      // trigger consumers:tab:click
      // expect callback.showConsumerInfos toHaveBeenCalled()
    });

    xit("should show farmers infos when a 'farmers:tab:click' is fired.", function() {
      // bind callback to participateController.participateView
      // trigger farmers:tab:click
      // expect callback.showFarmerInfos toHaveBeenCalled()
    });

  });

  describe("ParticipateView", function() {

    beforeEach(function() {
      // Mock the $.ajax function to prevent XHR:
      spyOn($, "ajax").andCallFake(function(params) {});
    });

    it("should be presented in a modal view.", function() {
      expect(participateController.participateView.$el).toHaveClass("reveal-modal");
    });

    it("should define an event for closing the reveal view", function() {
      expect(participateController.participateView._events["reveal:closed"]).toBeDefined();
    });


  });

});
