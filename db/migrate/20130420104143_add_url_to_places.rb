class AddUrlToPlaces < ActiveRecord::Migration
  def change
    add_column :places, :contact_url, :string
  end
end
