class CreateDepots < ActiveRecord::Migration
  def change
    create_table :depots do |t|
      t.string :name

      t.timestamps
    end
  end
end
