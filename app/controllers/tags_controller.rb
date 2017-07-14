class TagsController < ApplicationController
  def show
    @tag = Tag.find_by(name: params[:id])
    @posts = @tag.posts #получаем все посты в этим тэгом
  end

  
 
end
