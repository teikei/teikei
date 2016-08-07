ActiveAdmin.register User do

  member_action :confirm_user, method: :post do
    user = User.find(params[:id])
    user.confirmed_at = Time.now
    user.save!
    redirect_to [:admin, user], notice: "User account was confirmed."
  end

  member_action :suspend_user, method: :post do
    user = User.find(params[:id])
    user.confirmed_at = nil
    user.save!
    redirect_to [:admin, user], notice: "User account was suspended."
  end

  form do |f|
    inputs "User Details" do
      input :name
      input :email
      input :phone
      input :password
      input :password_confirmation
    end
    actions
  end

  index do
    column :id , sortable: :id do |user|
      link_to user.id, [:admin, user]
    end
    column :email
    column :current_sign_in_at
    column :last_sign_in_at
    column :sign_in_count
    column("Associated Places") { |u| u.places.count }
    column :confirmed_at
  end

  filter :email
  filter :phone
  filter :created_at
  filter :updated_at
  filter :last_sign_in_at

  sidebar "Actions", only: :show do
    if user.confirmed_at.nil?
      button_to "Confirm account", confirm_user_admin_user_path(user)
    else
      button_to "Suspend account", suspend_user_admin_user_path(user)
    end
  end

end
