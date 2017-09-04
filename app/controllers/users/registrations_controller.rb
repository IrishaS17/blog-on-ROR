class Users::RegistrationsController < Devise::RegistrationsController
  def new
    super
  end

  def create
    @user = User.new(post_params)
    super
  end

  def update
    super
  end

  private

   def post_params
      params.require(:user).permit(:email, :password, :name, :sex, :password_confirmation)
    end
end 