# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)


=begin
  admin = User.create(
    :name => "Admin",
    :email => "irishaapple@gmail.com",
    :admin => true,
    :password => "000000"
)

admin.save!


5.times do 
  Category.create(
    name: Faker::Lovecraft.word,
    created_at: Faker::Date.backward
  )
end

5.times do 
  Category.create(
    name: Faker::Lovecraft.word,
    created_at: Faker::Date.backward,
    ancestry: Faker::Number.between(1, Category.count)
  )
end
=end

20.times do
	Post.create(
		title: Faker::Lovecraft.sentence(3, 1),
    preview: Faker::Lovecraft.paragraph,
    body: Faker::Lovecraft.paragraph(4),
    created_at: Faker::Date.backward(14),
    category_id: Faker::Number.between(1, Category.count),
    user_id: Faker::Number.between(1, User.count)
	)
end

15.times do
  Tag.create(
    name: Faker::Lovecraft.word,
    created_at: Faker::Date.backward(14)
  )
end

32.times do
  Tagging.create(
	  tag_id: Faker::Number.between(1, Tag.count),
	  post_id: Faker::Number.between(1, Post.count),
	  created_at: Faker::Date.backward(14)
  )
end



puts "Seed finished"
puts "#{Post.count} Posts created"
puts "#{Tag.count} Tag created"
puts "#{Tagging.count} Tagging created"
