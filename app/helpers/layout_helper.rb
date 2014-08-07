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

  def layout_render_textblock(block)
    fmt = block.body_format.to_sym

    if fmt == :haml
      content = Haml::Engine.new(block.body).render
    elsif fmt == :markdown
      content = layout_render_markdown(block.body)
    end

    content.html_safe
  end

end
