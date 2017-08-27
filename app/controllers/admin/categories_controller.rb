class CategoriesController < ApplicationController
  
  before_action :set_category, only: [:edit, :update, :destroy, :show]

  def show
    @posts = Post.where(category_id: [@category.subtree_ids]).paginate(page: params[:page], per_page: 5)
  end

  def index
  	@categories = Category.all
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
    @categories = Category.where("id != #{@category.id}").order(:name)
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
    params.require(:category).permit(:name, :parent_id)
  end
end
