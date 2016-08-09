require 'rails_helper'

describe 'EmailValidator' do

  before(:each) do
    @validator = EmailValidator.new({:attributes => [:email]})
    @mock = double('model')
    allow(@mock).to receive('errors').and_return([])
    allow(@mock.errors).to receive('[]').and_return({})
    allow(@mock.errors[]).to receive('<<')
  end

  it 'should validate valid address' do
    expect(@mock).not_to receive('errors')
    @validator.validate_each(@mock, 'email', 'test@test.com')
  end

  it 'should validate invalid address' do
    expect(@mock.errors[]).to receive('<<')
    @validator.validate_each(@mock, 'email', 'notvalid')
  end

end
