Rails.application.routes.draw do
  # Define routes for regular users
  devise_for :users, controllers: { confirmations: 'confirmations' }

  namespace :api, defaults: {format: :json} do
    namespace :v1 do
      resources :farms, except: [:new, :edit]
      resources :depots, except: [:new, :edit]
      resources :places, only: [:index]
      resources :sessions, only: [:create, :destroy]
      resources :users, only: [:create, :show]
      resources :images, only: [:show, :create, :destroy]
      get "geocode" => 'geocoder#geocode'
      resources :messages, only: [:index, :create]
      post "send_message" => "place_messages#create"
    end
  end

  ActiveAdmin.routes(self)

  root :to => "home#index"
  get "map" => "home#map"
  get "contact" => "contact_messages#new"
  get "terms" => "text_blocks#terms"
  get "about" => "text_blocks#about"
  get "faq" => "faqs#index"

  resources :contact_messages, only: [:new, :create]

end
