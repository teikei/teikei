class CreateImages < ActiveRecord::Migration
  def change
    create_table :images do |t|
      t.string :file
      t.string :description
      t.integer :place_id

      t.timestamps
    end
  end
end
