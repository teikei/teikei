class ContactMessagesController < InheritedResources::Base
  actions :new

  respond_to :html

  def create
    @contact_message = ContactMessage.new(params[:contact_message])

    unless @contact_message.valid?
      render :new
      return
    end

    if AdminMailer.message_email(@contact_message).deliver
      flash[:notice] = t(".controllers.messages.success.email_sent")
    else
      flash[:error] = t(".controllers.messages.errors.email_not_sent")
    end
    redirect_to root_path
  end

end
