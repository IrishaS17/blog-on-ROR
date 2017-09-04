class UsersController < ApplicationController
  
  def index
    @users = User.all.paginate(:page => params[:page], :per_page => 5)
    #@amount_of_posts = @users.posts.count
  end

  def create
    @user = User.new(post_params)
  end

  def new
  	@user = User.new
  	
  end

  def edit

  end

  def show
    @users = User.find(params[:id])
  end

  def update
    
  end

  def destroy
    @user.destroy
    
  end
  
  private

   def post_params
      params.require(:user).permit(:email, :password, :name, :sex, :password_confirmation)
    end
end
