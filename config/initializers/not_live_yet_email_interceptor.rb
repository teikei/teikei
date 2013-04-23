class NotLiveYetEmailInterceptor
  def self.delivering_email(message)
    message.subject = "#{message.to} #{message.subject}"
    message.to = [ ENV["GMAIL_USERNAME"] ]
  end
end

ActionMailer::Base.register_interceptor(NotLiveYetEmailInterceptor) if Rails.env.development?

