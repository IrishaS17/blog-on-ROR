class UsersController < ApplicationController
  def index
    @users = User.all
  	#render text: @users.each { |i| "#{i.name}".join("</br>")}
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
