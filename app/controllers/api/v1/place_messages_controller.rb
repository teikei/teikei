# encoding: UTF-8
class Api::V1::PlaceMessagesController < ApplicationController

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
      begin
        place = Place.find(form_data[:place_id])
      rescue
        render json: { error: I18n.t("messages_controller.errors.invalid_recipient") }, status: 422
        return
      end

      message_data = Hash.new
      message_data["to"] = place.contact_email
      message_data["name"] = form_data[:name]
      message_data["email"] = form_data[:email]
      message_data["message"] = form_data[:message]

      message = PlaceMessage.new(message_data)
      begin
        if message.deliver
          render json: { message: I18n.t("messages_controller.success.message_sent", recipient: place.contact_name) }, status: 201
        else
          render json: { error: I18n.t("messages_controller.errors.message_not_sent", recipient: place.contact_name) }, status: 401
        end
      rescue => e
        if e.is_a?(ArgumentError) && e.message == "An SMTP To address is required to send a message. Set the message smtp_envelope_to, to, cc, or bcc address."
          render json: { error: I18n.t("messages_controller.errors.invalid_recipient_address", recipient: place.contact_name) }, status: 422
        else
          render json: { error: e.message }, status: 500
        end
      end
    end

end
