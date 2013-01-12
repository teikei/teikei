require "spec_helper"

describe "/api/v1/farms" do
	let(:user) { create(:user) }
	let(:token) { user.authentication_token }

	before do
		@testfarm = create(:farm, name: "Testfarm")
		create(:farm, name: "Access denied")
	end

	shared_examples_for "any user role" do
		it "returns all farms" do
			get "/api/v1/farms.json", auth_token: :token

			ability = Ability.new(user)
			farms_json = Farm.accessible_by(ability).to_json

			assert last_response.ok?
			last_response.body.should eql(farms_json)
			last_response.status.should eql(200)

			farms = JSON.parse(last_response.body)

			farms.any? do |farm|
				farm["name"] == "Testfarm"
			end.should be_true

			farms.any? do |farm|
				farm["name"] == "Access denied"
			end.should be_true
		end
	end


	context "when an anonymous user visits" do
		it_behaves_like "any user role"
	end

	context "when an admin user visits" do
		before do
			user.add_role :admin
			@testfarm.user :user
		end
		it_behaves_like "any user role"
	end

	context "when a regular user visits" do
		before do
			user.add_role :user
			@testfarm.user :user
		end
		it_behaves_like "any user role"
	end
end
