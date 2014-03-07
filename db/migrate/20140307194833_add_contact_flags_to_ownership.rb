class AddContactFlagsToOwnership < ActiveRecord::Migration
  def change
    add_column :ownerships, :contact_by_email, :boolean, default: false
    add_column :ownerships, :contact_by_phone, :boolean, default: false
  end
end
