class Admin::PostsController < AdminController

  before_action :set_post, only: [:destroy, :update]
 

  def index
    @posts = Post.paginate(:page => params[:page], per_page: 5)
  end

  def destroy
  	@post.destroy
    redirect_to posts_path #вывод всех статей
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
end
#не работает удаление, попробуй решить с помощью cancancan
