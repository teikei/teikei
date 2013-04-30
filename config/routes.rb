Teikei::Application.routes.draw do

  namespace :api, defaults: {format: :json} do
    namespace :v1 do
      resources :farms, except: [:new, :edit]
      resources :depots, except: [:new, :edit]
      resources :places, only: [:index]
      resources :sessions, only: [:create, :destroy]
      resources :users, only: [:create]
      match "geocode" => 'geocoder#geocode'
    end
  end

  # devise_for :users, :controllers => { :sessions => "api/v1/sessions" }
  # devise_scope :user do
  #   namespace :api do
  #     namespace :v1 do
  #       resources :sessions, :only => [:create, :destroy]
  #     end
  #   end
  # end

  resources :farms
  ActiveAdmin.routes(self)

  devise_for :users
  # authenticated :user do
  #   root :to => 'home#index'
  # end
  root :to => "home#index"
  resources :users
  resources :messages, only: [:index, :create]

  match "contact" => "messages#index"
  match "send_message" => "messages#create"

  # Jasmine test engine
  mount JasmineRails::Engine => "/specs" unless Rails.env.production?
end
