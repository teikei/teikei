include LayoutHelper

ActiveAdmin.register TextBlock do
  form do |f|
    inputs do
      input :name
      input :title
      input :body
      input :body_format, as: :select, collection: [ 'haml', 'markdown' ]
      input :locale
      input :public
    end
    actions
  end

  index do
    column :id, sortable: :id do |block|
      link_to block.id, [:admin, block]
    end

    column :name
    column :locale
    column :title
    column :body do |block|
      truncate block.body, length: 20
    end

    column :public
    column :updated_at
  end

  show title: :name do
    panel "Preview" do
      div do
        layout_render_textblock(text_block)
      end
    end
  end
end

