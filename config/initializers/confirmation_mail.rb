module Devise::Models::Confirmable

  def send_on_create_confirmation_instructions
    ConfirmationMailer.confirmation_email(self).deliver
  end

end
