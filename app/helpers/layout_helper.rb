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
    begin
      content = layout_render_markdown(block.body)
    rescue Exception => msg
      content = "<b>ERROR rendering TextBlock with id #{block.id} (#{block.title})</b>"
      content += "<p>#{ERB::Util.html_escape(msg.to_s)}</p>"
    end
    content.html_safe
  end

end
