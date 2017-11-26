class ContactMessagesController < InheritedResources::Base
  respond_to :html
  before_action :load_textblock

  def new
    @contact_message = ContactMessage.new
  end

  def create
    @contact_message = ContactMessage.new(params[:contact_message])

    unless @contact_message.valid?
      flash[:error] = @contact_message.errors.messages
      render action: 'new'
      return
    end

    User.with_role(:superadmin).each do |superadmin|
      AppMailer.admin_message(@contact_message, superadmin).deliver_now
    end

    flash[:notice] = t('controllers.messages.success.email_sent')
    render 'success'
  end

  def success
  end

  def error
  end

  private

  def load_textblock
    @contact_info_block = TextBlock.block_for('contact_info', I18n.locale)
  end

end
