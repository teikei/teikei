class AddSuperadminToUser < ActiveRecord::Migration
  def up
    add_column :users, :superadmin, :boolean, :null => false, :default => false
    User.create! do |r|
      r.email      = ENV["DEFAULT_ADMIN_EMAIL"].dup
      r.password   = ENV["DEFAULT_ADMIN_PASSWORD"].dup
      r.superadmin = true
    end
  end

  def down
    User.find_by_email(ENV["DEFAULT_ADMIN_EMAIL"].dup).try(:delete)
    remove_column :users, :superadmin
  end
end
