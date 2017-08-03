class Admin::PostsController < AdminController

  before_action :set_post, only: [ :edit, :update, :destroy]
 
  def create
	  @post = Post.new(post_params) #стронг параметрс - фильтрация параметров, которые мы получаем
  	if @post.save
  		redirect_to  @post #если сохранилось перенаправляем на созданный пост
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
  		redirect_to  @post
  	else
  		render :edit
  	end
  end

  def destroy
  	@post.destroy
    redirect_to posts_path #вывод всех статей
  end

  private
    def post_params
    	params.require(:post).permit(:title, :preview, :body, :image, :all_tags, :category_id)
    end

    def set_post
     @post = Post.find(params[:id])
    end
end
