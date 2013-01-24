class AddGeolocationToFarms < ActiveRecord::Migration
  def change
    add_column :farms, :lat, :decimal, {:precision=>15, :scale=>10}
    add_column :farms, :lng, :decimal, {:precision=>15, :scale=>10}  
  end
end
