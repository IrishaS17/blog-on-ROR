class CategoriesController < ApplicationController
  before_action :set_category, only: [:show, :edit, :update, :destroy]

  def index
  	@categories = Category.all
  end

  def show

  end

  def new
  	@category = Category.new
    @categories = Category.all.order(:name)
  end

  def create
  	@category = Category.new(category_params)
  	if @category.save
      redirect_to categories_path
    else
      @categories = Category.all.order(:name)
    	render :new
    end
  end

  def edit
    @categories = Category.where("id != #{@category}").order(:name)
  end

  def update
   	if @category.update_attributes(category_params)
   	  redirect_to categories_path
    else
      @categories = Category.where("id != #{@category}").order(:name)
      render :edit
    end
  end

  def destroy
    @category.destroy
    redirect_to categories_path
  end

  private

  def set_category
  	@category = Category.find(params[:id])
  end

  def category_params
    params.require(:category).permit(:name)
  end
end
