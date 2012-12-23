class RemoveSuperadminFromUsers < ActiveRecord::Migration

  # remove superadmin as it will be created in seeds file after
  # roles have been defined.
  def up
    remove_column :users, :superadmin
    superadmin = User.find_by_email(ENV["DEFAULT_ADMIN_EMAIL"].dup)
    if superadmin
      superadmin.remove_role(:user)
      superadmin.destroy
    end
  end

  def down
    add_column :users, :superadmin, :boolean, null: false, default: false
    User.create! do |r|
      r.email      = ENV["DEFAULT_ADMIN_EMAIL"].dup
      r.password   = ENV["DEFAULT_ADMIN_PASSWORD"].dup
      r.superadmin = true
    end
  end
end
