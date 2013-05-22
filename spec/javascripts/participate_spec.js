describe("Participate", function() {

  var participateController;

  beforeEach(function () {
    loadFixtures('menu.html');
    participateController = new Teikei.Participate.Controller();
  });

  it("should contain a ParticipateView.", function() {
    expect(participateController.participateView).toBeInstanceOf(Teikei.Participate.ParticipateView);
  });


  describe("ParticipateView", function() {

    beforeEach(function() {
      // Mock the $.ajax function to prevent XHR:
      spyOn($, "ajax").andCallFake(function(params) {});
    });

    it("should be presented in a modal view.", function() {
      expect(participateController.participateView.$el).toHaveClass("reveal-modal");
    });

  });

});
