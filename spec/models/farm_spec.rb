require 'spec_helper'

describe Farm do

  before { @farm = build(:farm) }

  subject { @farm }

  it { should respond_to :name }
  it { should respond_to :location }

end
