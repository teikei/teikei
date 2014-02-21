class Api::V1::PlaceMessagesController < ApplicationController
  include Teikei::PlaceMessaging
  respond_to :json

  def create
    message = PlaceMessage.new(params[:place_message])
    if message.valid?
      send_place_message(message)
    else
      render json: { error: I18n.t("messages_controller.errors.missing_form_data") }, status: 422
    end
  end

  private

  def send_place_message(message)
    begin
      place = Place.find(message.place_id)
    rescue
      render json: { error: I18n.t("messages_controller.errors.invalid_recipient") }, status: 422
      return
    end
    deliver_place_message(place, message)
  end
end
