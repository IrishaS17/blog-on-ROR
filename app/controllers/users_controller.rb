class UsersController < ApplicationController
  def index
    @users = User.all.paginate(:page => params[:page], :per_page => 5)
    #@amount_of_posts = @users.posts.count
  end

  def create

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

  end

end
