class CreatePlaceConnections < ActiveRecord::Migration
  def change
    create_table :place_connections, force: true do |t|
      t.integer :place_a_id, null: false
      t.integer :place_b_id, null: false
    end
  end
end
