require 'spec_helper'

describe User do

  before { @user = build(:user) }

  subject { @user }

  it { should respond_to :name }
  it { should respond_to :email }
  it { should respond_to :password }
  it { should respond_to :password_confirmation }
  it { should respond_to :encrypted_password }
  its(:encrypted_password){ should_not be_blank }

  it "should be valid" do
    expect(@user).to be_valid
  end

  it "requires a name" do
    @user.name = nil
    expect(@user).not_to be_valid
  end

  it "requires a name" do
    @user.name = ''
    expect(@user).not_to be_valid
  end

  it "rejects a name identical up to case" do
    pending "Does not validate true. Please fix."
    # user = build(:user, name: @user.name.upcase, email: "email@test.com")
    # expect(user).not_to be_valid
  end

  it "requires an email address" do
    @user.email = nil
    expect(@user).not_to be_valid
  end

  it "requires an email address" do
    @user.email = ''
    expect(@user).not_to be_valid
  end

  it "accepts valid email addresses" do
    addresses = %w[user@foo.com THE_USER@foo.bar.org first.last@foo.jp]
    addresses.each do |address|
      @user.email = address
      expect(@user).to be_valid
    end
  end

  it "rejects invalid email addresses" do
    addresses = %w[user@foo,com user_at_foo.org example.user@foo.]
    addresses.each do |address|
      @user.email = address
      expect(@user).not_to be_valid
    end
  end

  it "rejects duplicate email addresses" do
    create(:user)
    expect(@user).not_to be_valid
  end

  it "rejects email addresses identical up to case" do
    create(:user, email: @user.email.upcase)
    expect(@user).not_to be_valid
  end

  it "rejects a too long email address" do
    too_long_address = "email@" + "a" * 91 + ".com"
    @user.email = too_long_address
    expect(@user).not_to be_valid
  end

  it "requires a password" do
    @user.password = nil
    expect(@user).not_to be_valid
  end

  it "requires a password" do
    @user.password = ''
    expect(@user).not_to be_valid
  end

  it "requires a matching password confirmation" do
    @user.password_confirmation = 'invalid'
    expect(@user).not_to be_valid
  end

  it "rejects short passwords" do
    short = "a" * 5
    @user.password = short
    @user.password_confirmation = short
    expect(@user).not_to be_valid
  end

  it "rejects too long passwords" do
    too_long = "a" * 41
    @user.password = too_long
    @user.password_confirmation = too_long
    expect(@user).not_to be_valid
  end

  it "requires a password confirmation" do
    @user.password_confirmation = nil
    expect(@user).not_to be_valid
  end

  it "has the default role :user after creation" do
    @user = create(:user)
    expect(User.last).to have_role :user
  end

end
