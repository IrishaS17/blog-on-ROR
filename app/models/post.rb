class Post < ApplicationRecord
	validates :title, :body, presence: true
	mount_uploader :image, ImageUploader
	#after_create {UserMailer.new_user_created(self).deliver}
	#after_destroy {category.inc(:user_count, -1)}
	
end
