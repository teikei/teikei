class CreateFarms < ActiveRecord::Migration
  def change
    create_table :farms, inherits: :place do |t|
      t.date :founded_at
      t.integer :maximum_members
      t.text :products
      t.string :farming_standard
      t.text :participation
      t.timestamps
    end
  end
end
