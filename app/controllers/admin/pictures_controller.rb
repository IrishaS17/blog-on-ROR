class Admin::PicturesController < ApplicationController
 #protect_from_forgery except: :create
  # before_action :authenticate_user!
 def create
    @picture = Picture.new(image_params)
    @picture.save
      #format.json {render :json => {url: Refile.attachment_url(@picture, :image), picture_id: @picture_id} }
      format.json { render :json => { url: @picture.image.url(:large), picture_id: @picture.id } }
    end
  end

  def destroy
    picturse = Picture.find(params[:id])
    picture.destroy
    respond_to do |format|
      format.json {render :json => {status: :ok} }
    end
  end

  private

  def image_params
    params.require(:picture).permit(:image) #проверяем данные
  end
end
