class FaqsController < ApplicationController

  def index
    @faqs = Faq.where(locale: I18n.locale, enabled: true).order('priority DESC')
  end

end

