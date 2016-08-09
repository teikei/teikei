require 'rails_helper'

describe '/api/v1/send_message', type: :request do

  let(:url) { '/api/v1' }

  it 'sends valid place form data' do
    place = create(:place)
    params = {}
    params[:place_message] = FactoryGirl.attributes_for(:place_message)
    params[:place_message][:place_id] = place.id
    post "#{url}/send_message", params
    expect(last_response.status).to eq(201)
  end

  it 'rejects sending incomplete place form data (missing: name)' do
    place = create(:place)
    params = {}
    params[:place_message] = FactoryGirl.attributes_for(:place_message)
    params[:place_message][:place_id] = place.id
    params[:place_message][:name] = nil
    post "#{url}/send_message", params
    expect_missing_form_data_failure(last_response, place.users.first.name)
  end

  it 'rejects sending incomplete place form data (missing: email)' do
    place = create(:place)
    params = {}
    params[:place_message] = FactoryGirl.attributes_for(:place_message)
    params[:place_message][:place_id] = place.id
    params[:place_message][:email] = nil
    post "#{url}/send_message", params
    expect_missing_form_data_failure(last_response, place.users.first.name)
  end

  it 'rejects sending incomplete place form data (missing: message)' do
    place = create(:place)
    params = {}
    params[:place_message] = FactoryGirl.attributes_for(:place_message)
    params[:place_message][:place_id] = place.id
    params[:place_message][:message] = nil
    post "#{url}/send_message", params
    expect_missing_form_data_failure(last_response, place.users.first.name)
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

  it 'rejects sending place form data containing a non-existing places id' do
    params = {}
    params[:place_message] = FactoryGirl.attributes_for(:place_message)
    params[:place_message][:place_id] = -1
    post "#{url}/send_message", params
    expect_invalid_recipient_failure(last_response)
  end

end
