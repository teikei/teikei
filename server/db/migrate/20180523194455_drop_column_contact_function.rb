class DropColumnContactFunction < ActiveRecord::Migration
  def change
    remove_column :places, :contact_function
  end
end
