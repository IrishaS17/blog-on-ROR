class UsersMailer < ApplicationMailer
	def new_user(user)
		@user = user
    mail to: '#{user.email}',
         subject: 'Hello, new user!'
	end
end
