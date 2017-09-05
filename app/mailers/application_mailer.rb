class ApplicationMailer < ActionMailer::Base
  default from: 'support@irishblog.com'
  template_path: 'mailers/user'
end
