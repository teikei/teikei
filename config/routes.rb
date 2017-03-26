Rails.application.routes.draw do
  devise_for :users, path: '/api/v1/users', controllers: { confirmations: 'confirmations' }
  # FIXME this is required as devise controllers call the wrong route still (the non-namespaced one)
  get '/users' => 'users#show'

  namespace :api, defaults: {format: :json} do
    namespace :v1 do
      resources :farms, except: [:new, :edit]
      resources :depots, except: [:new, :edit]
      resources :places, only: [:index, :show, :destroy]
      resources :sessions, only: [:create, :destroy]
      get 'users/me' => 'users#me'
      resources :users, only: [:create, :show]
      resources :images, only: [:show, :create, :destroy]
      get 'geocode/search' => 'geocoder#search'
      get 'geocode/autocomplete' => 'geocoder#autocomplete'
      get 'geocode/search/structured' => 'geocoder#structured_geocode'
      get 'geocode/autocomplete/combined' => 'geocoder#combined_search'
      resources :messages, only: [:index, :create]
      post 'send_message' => 'place_messages#create'
      get 'places/search', to: 'places#search'
    end
  end

  ActiveAdmin.routes(self)

  root :to => 'home#index'
  get 'map' => 'home#map'
  get 'map/*all' => 'home#map'
  get 'contact' => 'contact_messages#new'
  get 'terms' => 'text_blocks#terms'
  get 'about' => 'text_blocks#about'
  get 'faq' => 'faqs#index'



  resources :contact_messages, only: [:new, :create]

end
