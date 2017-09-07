class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable and :omniauthable
  validates :name, presence: true, uniqueness: true
  validates :email, :presence => true, :email => true
  #validates_format_of :email,:with => Devise::email_regexp
  #validates :sex, presence: true
  #mount_uploader :image, ImageUploader
  devise :database_authenticatable, :registerable,
         :recoverable, :confirmable, :rememberable, :validatable

  has_many :posts, dependent: :destroy 
end
