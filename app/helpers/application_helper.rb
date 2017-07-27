module ApplicationHelper
  def build_breadcrumb(category)
  	result = [] 
  	category.ancestors.each do |ancestor| #берем все вложенные 
  		result << content_tag(:li, class: 'breadcrumb-item') do #вставляем ссылки в тэги
  			link_to(ancestor.name, ancestor) 
  		end
  	end
  	result << content_tag(:li, category.name, class: "breadcrumb-item active") #добавим имя текущей категории 
  	result.join('').html_safe #выводим массив в html
  end

  def bootstrap_class_for(name)
    {
      success: "alert-success",
      error: "alert-danger",
      danger: "alert-danger",
      alert: "alert-warning",
      notice: "alert-info"
    }[name.to_sym] || name
  end
end
