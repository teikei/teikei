module LayoutHelper

  def layout_render_markdown(text)
    options = { :hard_wrap => true,
                :autolink  => true,
                :no_intraemphasis => true,
                :fenced_code => true,
                :filter_html => false,
              }
    markdown = Redcarpet::Markdown.new(Redcarpet::Render::HTML, options)
    markdown.render(text)
  end

  def layout_render_textblock(block, layout = nil)
    fmt = block.body_format.to_sym

    if fmt == :haml
      content = block.body
      type = :haml
    elsif fmt == :markdown
      content = layout_render_markdown(block.body)
      type = :html
    end

    render :inline => content, :type => type, :layout => layout
  end

end
