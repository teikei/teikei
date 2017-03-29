class Api::V1::ConfirmationsController < Devise::ConfirmationsController
  def show
    self.resource = resource_class.confirm_by_token(params[:confirmation_token])
    yield resource if block_given?

    if resource.errors.empty?
      set_flash_message(:notice, :confirmed) if is_flashing_format?
      sign_in(resource) # <= THIS LINE ADDED
      respond_with_navigational(resource){ redirect_to map_url(resource) }
    else
      respond_with_navigational(resource.errors, :status => :unprocessable_entity){ render :new }
    end
  end

  private

  def map_url(user)
    if user.origin.include? 'solawi'
      user.origin + '/vernetzungsplatform#/?after_confirmation=true'
    else
     user.origin + '/map#/?after_confirmation=true'
    end
  end

end
