class ContactMessagesController < InheritedResources::Base
  respond_to :html

  def new
    @contact_message = ContactMessage.new
    @contact_info_block = TextBlock.block_for('contact_info', I18n.locale)
  end

  def create
    @contact_message = ContactMessage.new(params[:contact_message])

    unless @contact_message.valid?
      render :new
      return
    end

    if AdminMailer.message_email(@contact_message).deliver_now
      flash[:notice] = t(".controllers.messages.success.email_sent")
    else
      flash[:error] = t(".controllers.messages.errors.email_not_sent")
    end
    redirect_to root_path
  end

end
