class RemoveAuthenticationTokenFromUsers < ActiveRecord::Migration
  def up
    remove_column :users, :authentication_token
  end

  def down
    add_column :users, :authentication_token, :string
  end
end
