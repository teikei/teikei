class CreateFarms < ActiveRecord::Migration
  def change
    create_table :farms, inherits: :place do |t|
      t.timestamps
    end
  end
end
