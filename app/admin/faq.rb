ActiveAdmin.register Faq do

  filter :updated_at
  filter :enabled
  filter :locale
  filter :question
  filter :answer

  index do |faq|
    column :id , :sortable => :id do |faq|
      link_to faq.id, [:admin, faq]
    end

    column :question
    column :answer
    column :locale
    column :priority
  end

  show do
    panel "Details" do
      attributes_table_for faq do
        row :id
        row :question
        row :answer
        row :locale
        row :priority
        row :enabled
        row :created_at
        row :updated_at
      end
    end
  end

  form do |f|
    f.inputs "Details" do
      f.input :question
      f.input :answer
      f.input :locale
      f.input :priority
      f.input :enabled
    end

    f.buttons
  end

  sidebar "Details", :only => :show do
    attributes_table_for faq do
      row :question
      row :answer
      row :locale
      row :priority
      row :enabled
      row :updated_at
    end
  end

end

