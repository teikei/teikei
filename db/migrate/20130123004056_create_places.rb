class CreatePlaces < ActiveRecord::Migration
  def change
    create_table :places do |t|
      t.string :name
      t.string :location
      t.decimal :lat, precision: 15, scale: 10
      t.decimal :lng, precision: 15, scale: 10
      t.string :subtype

      t.timestamps
    end
  end
end
