class DropActiveAdminComments < ActiveRecord::Migration
  def change
      drop_table :active_admin_comments  if ActiveRecord::Base.connection.table_exists? 'active_admin_comments'
  end
end
