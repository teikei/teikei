Teikei::Application.routes.draw do

  # Define routes for regular users
  devise_for :users, controllers: { sessions: "sessions" }

  # Define routes for admin users
  config = ActiveAdmin::Devise.config
  config[:controllers][:sessions] = "sessions"
  # Override standard_path_variable naming for admins:
  config[:as] = "admin" # See `rake routes`
  devise_for :users, config

  namespace :api, defaults: {format: :json} do
    namespace :v1 do
      resources :farms, except: [:new, :edit]
      resources :depots, except: [:new, :edit]
      resources :places, only: [:index]
      resources :sessions, only: [:create, :destroy]
      resources :users, only: [:create]
      match "geocode" => 'geocoder#geocode'
      resources :messages, only: [:index, :create]
      match "send_message" => "messages#create"
    end
  end

  ActiveAdmin.routes(self)

  root :to => "home#index"
  resources :messages, only: [:index, :create]

  match "contact" => "messages#index"
  match "send_message" => "messages#create"

  # Jasmine test engine
  mount JasmineRails::Engine => "/specs" if defined?(JasmineRails)
end
