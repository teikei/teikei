require "spec_helper"

describe "/api/v1/farms" do
	let(:user) { create(:user) }
	let(:token) { user.authentication_token }

	before do
		user.add_role :user
		create(:farm, user: user, name: "Testfarm")
		create(:farm, name: "Access denied")
		@ability = Ability.new(user)
	end

	context "farms viewable by this logged-in user" do
		let(:url) { "/api/v1/farms" }
		it "json" do
			get "#{url}.json"

			farms_json = Farm.accessible_by(@ability).to_json

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
end
