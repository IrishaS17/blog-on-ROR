class User < ApplicationRecord
	#validates :phone, numericality: {  greater_than: 0 }
	validates :email, :password, presence: true
	validates :email, uniqueness: true
	before_validation :ensure_login_has_a_value

	
	#after_create {UserMailer.new_user_created(self).deliver}
	#after_destroy {category.inc(:user_count, -1)}
	def ensure_login_has_a_value
      if name.nil?
        self.name = email unless email.blank?
        puts "----------------------"
      end
    end
end
