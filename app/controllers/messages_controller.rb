class MessagesController < ApplicationController

  respond_to :html

  def create
    if params.has_key? :contact_form
      create_contact_message(params[:contact_form])
    elsif params.has_key? :place_form
      create_place_message(params[:place_form])
    else
      redirect_to root_path, notice: t(".controllers.messages.errors.missing_form_data")
    end
  end


  private

    def create_contact_message(form_data)
      message = ContactMessage.new(form_data)
      if message.deliver
        flash[:notice] = t(".controllers.messages.success.email_sent")
        render :index
      else
        flash[:notice] = t(".controllers.messages.errors.email_not_sent")
        render :index
      end
    end

    def create_place_message(form_data)
      begin
        place = Place.find(form_data[:places_id])
      rescue
        redirect_to root_path, notice: t(".controllers.messages.errors.place.not_found")
        return
      end

      message_data = Hash.new
      message_data["to"] = place.contact_email
      message_data["name"] = form_data[:name]
      message_data["email"] = form_data[:email]
      message_data["message"] = form_data[:message]

      message = PlaceMessage.new(message_data)
      if message.deliver
        redirect_to root_path, notice: t(".controllers.messages.success.email_sent_to", contact_name: place.contact_name)
      else
        redirect_to root_path, notice: t(".controllers.messages.errors.email_not_sent_to", contact_name: place.contact_name)
      end
    end

end
