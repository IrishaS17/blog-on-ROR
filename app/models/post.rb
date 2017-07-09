class Post < ApplicationRecord
  validates :title, :body, presence: true
  mount_uploader :image, ImageUploader

  has_many :taggings
  has_many :tags, through: :taggings
	
  def all_tags
    tags.map(&:name).join(', ') # tags.map(&:name.to_proc).join(', ')блок метода 
  end

  def all_tags=(names)
  	self.tags = names.split(',').map do |name|
  	  Tag.where(name: name.strip).first_or_create
  	end
  end
end
