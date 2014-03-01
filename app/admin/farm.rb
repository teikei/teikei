ActiveAdmin.register Farm do
  form do |f|
    PlaceForm.form(f)
    f.inputs "Additional Farm Info" do
      f.input :founded_at_year
      f.input :founded_at_month
      f.input :maximum_members
      f.input :accepts_new_members, as: :select, collection: ['yes', 'no', 'waitlist']
      f.input :vegetable_products, as: :select, collection: Farm.vegetable_products.values
      f.input :animal_products, as: :select, collection: Farm.animal_products.values
      f.input :beverages, as: :select, collection: Farm.beverages.values
      f.input :additional_product_information
      f.input :participation
      f.input :acts_ecological
      f.input :economical_behavior
      f.input :contact_function
      f.input :url
    end
    f.buttons
  end

  index do
    column :name
    column :location
    default_actions
  end
end
