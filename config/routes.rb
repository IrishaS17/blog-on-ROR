Rails.application.routes.draw do
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
  scope "/:locale" do
    root 'posts#index'
    resources :posts
    resources :users
    resources :pictures, only: [:create, :destroy]
    resources :tags, only: [:show]
  end
=begin  scope "(:locale)", locale: /#{I18n.available_locales.join("|")}/ do
	  root 'posts#index'
	  resources :users
	  resources :posts
=end

end
