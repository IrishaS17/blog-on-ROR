Rails.application.routes.draw do
  
  
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
  scope "/:locale" do
    devise_for :users, :controllers => { registrations: 'registrations' }
    root 'posts#index'
    resources :posts
    resources :users
    resources :tags, only: [:show]
    resources :categories
    #resources :pictures

    namespace :admin do
  
      resources :pictures, only: [:create, :destroy]
    end
  end
  
end
