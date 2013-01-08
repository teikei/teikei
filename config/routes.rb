Teikei::Application.routes.draw do
  namespace :api do
    namespace :v1 do
      resources :farms
    end
  end
  resources :farms
  ActiveAdmin.routes(self)

  authenticated :user do
    root :to => 'home#index'
  end
  root :to => "home#index"
  devise_for :users
  resources :users

  # Jasmine test engine
  mount JasmineRails::Engine => "/specs" unless Rails.env.production?
end
