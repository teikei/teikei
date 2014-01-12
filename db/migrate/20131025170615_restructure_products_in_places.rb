class RestructureProductsInPlaces < ActiveRecord::Migration
  def up
    rename_column :places, :products, :vegetable_products
    add_column :places, :animal_products, :string
    add_column :places, :beverages, :string
    add_column :places, :additional_product_information, :text
  end

  def down
    rename_column :places, :vegetable_products, :products
    remove_column :places, :animal_products
    remove_column :places, :beverages
    remove_column :places, :additional_product_information
  end
end
