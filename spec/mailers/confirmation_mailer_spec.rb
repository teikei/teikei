describe ConfirmationMailer do

  before(:each) do
    ActionMailer::Base.delivery_method = :test
    ActionMailer::Base.perform_deliveries = true
    ActionMailer::Base.deliveries = []
    @user = build(:user)
    @mail = ConfirmationMailer.confirmation_email(@user).deliver
  end

  after(:each) do
    ActionMailer::Base.deliveries.clear
  end

  it "sends the confirmation email" do
    expect(ActionMailer::Base.deliveries.empty?).to be(false)
    expect(ActionMailer::Base.deliveries.count).to eq(1)
  end

  it "renders the receiver email" do
    receiver_address = @user.email
    expect(@mail.to).to include(receiver_address)
    expect(ActionMailer::Base.deliveries.first.to).to include(receiver_address)
  end

  it "renders the sender email" do
    sender_address = ENV["EMAIL_SENDER_ADDRESS"]
    expect(@mail.from).to include(sender_address)
    expect(ActionMailer::Base.deliveries.first.from).to include(sender_address)
  end

  it "renders the email subject" do
    subject = I18n.t("devise.mailer.confirmation_instructions.subject")
    expect(@mail.subject).to eq(subject)
    expect(ActionMailer::Base.deliveries.first.subject).to eq(subject)
  end

  it "renders the user name in the email body" do
    expect(@mail.body.encoded).to include(@user.name)
  end

  it "renders the confirmation url" do
    confirmation_url = "http://example.com/users/confirmation"
    expect(@mail.body.encoded).to include(confirmation_url)
  end

end
