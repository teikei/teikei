class PagesController < ApplicationController

  respond_to :html

  def contact
  end

  def send_contact
    c = ContactForm.new(params[:contact_form])
    if c.deliver
      redirect_to root_path, :notice => 'E-Mail wurde erfolgreich versandt.'
    else
      redirect_to root_path, :notice => 'E-Mail konnte nicht versandt werden.'
    end
  end

end
