class Api::V1::PlaceMessagesController < ApplicationController
  respond_to :json

  def create
    message = PlaceMessage.new(params[:place_message])
    if message.valid?
      begin
        place = Place.find(message.place_id)
        deliver_place_message(place, message)
      rescue
        render json: {error: I18n.t('messages_controller.errors.invalid_recipient')}, status: 422
      end
    else
      render json: {error: I18n.t('messages_controller.errors.missing_form_data')}, status: 422
    end
  end

  private

  def deliver_place_message(place, message)
    begin
      if AppMailer.place_message(place, message).deliver_now
        render json: {message: I18n.t('messages_controller.success.message_sent', recipient: place.users.first.name)}, status: 201
      else
        render json: {error: I18n.t('messages_controller.errors.message_not_sent', recipient: place.users.first.name)}, status: 500
      end
    rescue => e
      if e.is_a?(ArgumentError) && e.message == 'An SMTP To address is required to send a message. Set the message smtp_envelope_to, to, cc, or bcc address.'
        render json: {error: I18n.t('messages_controller.errors.invalid_recipient_address', recipient: place.users.first.name)}, status: 422
      else
        render json: {error: e.message}, status: 500
      end
    end
  end
end
