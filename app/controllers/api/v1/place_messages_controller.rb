class Api::V1::PlaceMessagesController < ApplicationController
  include Teikei::PlaceMessaging
  respond_to :json

  def create
    message = PlaceMessage.new(params[:place_message])
    if message.valid?
      place = find_place(message.place_id)
      deliver_place_message(place, message)
    else
      render json: { error: I18n.t("messages_controller.errors.missing_form_data") }, status: 422
    end
  end

  private

  def find_place(id)
    begin
      place = Place.find(id)
    rescue
      render json: { error: I18n.t("messages_controller.errors.invalid_recipient") }, status: 422
      return
    end
  end
end
