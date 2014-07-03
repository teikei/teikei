ActiveAdmin.register User do

  member_action :confirm_user, :method => :post do
    user = User.find(params[:id])
    user.confirmed_at = Time.now
    user.save!
    redirect_to [:admin, user], :notice => "User account was confirmed."
  end

  member_action :suspend_user, :method => :post do
    user = User.find(params[:id])
    user.confirmed_at = nil
    user.save!
    redirect_to [:admin, user], :notice => "User account was suspended."
  end

  index do
    column :email
    column :current_sign_in_at
    column :last_sign_in_at
    column :sign_in_count
    column("Associated Places") { |u| u.places.count }
    column :confirmed_at
    default_actions
  end

  filter :email

  form do |f|
    f.inputs "User Details" do
      f.input :email
      f.input :password
      f.input :password_confirmation
    end
    f.actions
  end

  sidebar "Actions", :only => :show do
    if user.confirmed_at.nil?
      button_to "Confirm account", confirm_user_admin_user_path(user)
    else
      button_to "Suspend account", suspend_user_admin_user_path(user)
    end
  end

end
