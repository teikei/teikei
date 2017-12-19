class RemoveBodyFormatFromTextBlock < ActiveRecord::Migration
  def change
    remove_column :text_blocks, :body_format, :string
  end
end
