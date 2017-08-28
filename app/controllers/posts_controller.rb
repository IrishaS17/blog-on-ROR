class PostsController < ApplicationController
  before_action :authenticate_user!, except: [:index, :show]
  before_action :set_post, only: [:show, :edit, :update]
 
  def index
    if params[:search]
      @posts = Post.where('title LIKE ?', "%#{params[:search]}%").order(created_at: :asc).paginate(:page => params[:page], per_page: 5)
    else
      @posts = Post.order(created_at: :desc).paginate(:page => params[:page], per_page: 5)
    end
  end

  def show
  
  end
  
  def create
    @post = Post.new(post_params) #стронг параметрс - фильтрация параметров, которые мы получаем
    if @post.save
      redirect_to @post #если сохранилось перенаправляем на созданный пост
    else
      render :new # вводит ещё раз
    end
  end

  def new
    @post = Post.new
  end

  def edit
    
  end

  def update
    if @post.update_attributes(post_params)
      redirect_to @post
    else
      render :edit
    end
  end

  private

    def set_post
     @post = Post.find(params[:id])
    end

    def post_params
      params.require(:post).permit(:title, :preview, :body, :image, :all_tags, :category_id, :user_id)
    end
end
