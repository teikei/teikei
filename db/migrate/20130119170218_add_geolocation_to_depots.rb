class AddGeolocationToDepots < ActiveRecord::Migration
  def change
    add_column :depots, :lat, :decimal, {:precision=>15, :scale=>10}
    add_column :depots, :lng, :decimal, {:precision=>15, :scale=>10}
  end
end
