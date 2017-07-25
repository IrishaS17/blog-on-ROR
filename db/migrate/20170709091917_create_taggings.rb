class CreateTaggings < ActiveRecord::Migration[5.1]
  def change
    create_table :taggings do |t|
      t.belongs_to :post, foreign_key: true
      t.belongs_to :tag, foreign_key: true #данная запись не может существовать без записи в пост и тэг

      t.timestamps
    end
  end
end
