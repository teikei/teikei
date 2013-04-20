class AddContactFunctionToPlaces < ActiveRecord::Migration
  def change
    add_column :places, :contact_function, :string
  end
end
