class RenameContactUrlColumnToUrl < ActiveRecord::Migration
  def up
  	rename_column :places, :contact_url, :url
  end

  def down
  	rename_column :places, :url, :contact_url
  end
end
