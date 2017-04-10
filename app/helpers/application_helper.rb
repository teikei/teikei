module ApplicationHelper
  def em(text)
    content_tag(:em, text)
  end

  def abbr(text, title)
    "<abbr title='#{title}'>#{text}</abbr>".html_safe
  end

  def a(text, title, url)
    "<a href='#{url}' title='#{title}'>#{text}</a>".html_safe
  end

  def no_content_for(symbol)
    content_for(symbol) { '' }
  end

end
