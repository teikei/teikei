class CreateTextBlocks < ActiveRecord::Migration
  def change
    create_table :text_blocks do |t|
      t.string :name
      t.string :title
      t.text :body
      t.string :body_format
      t.string :locale
      t.boolean :public

      t.timestamps
    end
  end
end
