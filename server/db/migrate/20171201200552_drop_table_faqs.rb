class DropTableFaqs < ActiveRecord::Migration
  def change
    drop_table :faqs  if ActiveRecord::Base.connection.table_exists? 'faqs'
  end
end
