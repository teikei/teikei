require 'spec_helper'

describe "/api/v1/send_message" do

  let(:url) { "/api/v1" }

  it "sends valid place form data" do
    place = create(:place)
    params = {}
    params[:place_form] = FactoryGirl.attributes_for(:place_message)
    params[:place_form][:place_id] = place.id
    post "#{url}/send_message", params
    expect(last_response.status).to eq(201)
  end

  it "rejects sending incomplete place form data (missing: sender_name)" do
    place = create(:place)
    params = {}
    params[:place_form] = FactoryGirl.attributes_for(:place_message)
    params[:place_form][:place_id] = place.id
    params[:place_form][:sender_name] = nil
    post "#{url}/send_message", params
    expect_message_not_sent_failure(last_response, place.contact_name)
  end

  it "rejects sending incomplete place form data (missing: sender_email)" do
    place = create(:place)
    params = {}
    params[:place_form] = FactoryGirl.attributes_for(:place_message)
    params[:place_form][:place_id] = place.id
    params[:place_form][:sender_email] = nil
    post "#{url}/send_message", params
    expect_message_not_sent_failure(last_response, place.contact_name)
  end

  it "rejects sending incomplete place form data (missing: message)" do
    place = create(:place)
    params = {}
    params[:place_form] = FactoryGirl.attributes_for(:place_message)
    params[:place_form][:place_id] = place.id
    params[:place_form][:message] = nil
    post "#{url}/send_message", params
    expect_message_not_sent_failure(last_response, place.contact_name)
  end

  #
  # The following attributes are derived from the place id.
  # They are added to the message by the API/PlaceMessageController.
  #
  # - recipient_email
  # - recipient_name
  # - mail_form_path
  # - place_name
  #
  # For additional information take a look at the PlaceMessage model
  #

  it "rejects sending place form data containing a non-existing places id" do
    params = {}
    params[:place_form] = FactoryGirl.attributes_for(:place_message)
    params[:place_form][:place_id] = -1
    post "#{url}/send_message", params
    expect_invalid_recipient_failure(last_response)
  end

end
