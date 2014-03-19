include LayoutHelper

ActiveAdmin.register TextBlock do

  index do
    column :id, :sortable => :id do |block|
      link_to block.id, [:admin, block]
    end

    column :name
    column :locale
    column :title
    column :body do |block|
      truncate block.body, :length => 20
    end

    column :public
    column :updated_at
  end

  show :title =>  :name do
    panel "Preview" do
      div do
        layout_render_textblock(text_block, nil)
      end
    end
  end

  form do |f|
    f.inputs do
      f.input :name
      f.input :title
      f.input :body
      f.input :body_format, :as => :select, :collection => [ 'haml', 'markdown' ]
      f.input :locale
      f.input :public
    end

    f.buttons
  end

  sidebar "Text Block Details", :only => :show do
    attributes_table_for text_block do
      row :id
      row :name
      row :locale
      row :title
      row :body_format
      row :public
      row :updated_at
    end
  end

end

