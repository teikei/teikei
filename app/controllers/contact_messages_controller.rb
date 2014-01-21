class ContactMessagesController < InheritedResources::Base
  actions :new, :create

  respond_to :html

  def create
    create!(notice: t(".controllers.messages.success.email_sent"))
  end
end
