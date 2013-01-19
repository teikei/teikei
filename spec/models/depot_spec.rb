require 'spec_helper'

describe Depot do
  before { @depot = build(:depot) }

  subject { @depot }

  it { should respond_to :name }
  # it { should respond_to :location }
end
