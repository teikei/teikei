# encoding: UTF-8
class Api::V1::PlaceMessagesController < ApplicationController

  include Teikei::Permalinks
  include Teikei::PlaceMessaging
  respond_to :json

  def create
    if params.has_key? :place_form
      create_place_message(params[:place_form])
    else
      render json: { error: I18n.t("messages_controller.errors.missing_form_data") }, status: 422
    end
  end


  private

    def create_place_message(form_data)
      place_id = form_data[:place_id]
      begin
        place = Place.find(place_id)
      rescue
        render json: { error: I18n.t("messages_controller.errors.invalid_recipient") }, status: 422
        return
      end

      place_details_address = place_details_address(place_id)
      message = PlaceMessage.new_manual_contact_message(place, form_data, place_details_address)
      # Render success or error response to provide feedback
      deliver_place_message(message, place, true)
    end

end
