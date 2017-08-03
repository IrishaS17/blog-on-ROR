Rails.application.routes.draw do
  
  devise_for :users
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
  scope "/:locale" do
    root 'posts#index'
    resources :posts, only: [:show, :index]
    resources :users
    resources :tags, only: [:show]
    resources :categories, only: [:show] 

    namespace :admin do
      resources :posts, except: [:show, :index]
      resources :categories, except: [:show]
      resources :pictures, only: [:create, :destroy]

    end
  end
  
end
