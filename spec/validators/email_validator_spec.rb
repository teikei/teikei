require 'spec_helper'


describe "EmailValidator" do

  before(:each) do
    @validator = EmailValidator.new({:attributes => {}})
    @mock = double('model')
    @mock.stub("errors").and_return([])
    @mock.errors.stub('[]').and_return({})
    @mock.errors[].stub('<<')
  end

  it "should validate valid address" do
    @mock.should_not_receive('errors')
    @validator.validate_each(@mock, "email", "test@test.com")
  end

  it "should validate invalid address" do
    @mock.errors[].should_receive('<<')
    @validator.validate_each(@mock, "email", "notvalid")
  end

end
