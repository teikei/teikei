class MessagesController < ApplicationController

  respond_to :html

  def create
    if params.has_key? :contact_form
      create_contact_message(params[:contact_form])
    else
      redirect_to root_path, :notice => 'Unbekannter Fehler beim Versenden der E-Mail.'
    end
  end


  private

    def create_contact_message(form_data)
      message = ContactMessage.new(form_data)
      if message.deliver
        flash[:notice] = "E-Mail wurde erfolgreich versandt."
        render :index
      else
        flash[:notice] = "E-Mail konnte nicht versandt werden."
        render :index
      end
    end

end
