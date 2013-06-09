class MessagesController < ApplicationController

  respond_to :html

  def create
    if params.has_key? :contact_form
      create_contact_message(params[:contact_form])
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

end
