ActiveAdmin.register Faq do
  form do |f|
    inputs 'Details' do
      input :question
      input :answer, as: :text
      input :locale
      input :priority
      input :enabled
    end

    actions
  end

  index do |faq|
    column :id , sortable: :id do |faq|
      link_to faq.id, [:admin, faq]
    end

    column :question
    column :answer
    column :locale
    column :priority
  end

  show do
    panel 'Details' do
      attributes_table_for faq do
        row :id
        row :question
        row :answer do |faq|
          layout_render_markdown(faq.answer).html_safe
        end
        row :locale
        row :priority
        row :enabled
        row :created_at
        row :updated_at
      end
    end
  end

end

