package handlers

import (
	"net/http"
	"text/template"
)

// Отображение главной страницы с формой ввода
func Home(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" {
		http.NotFound(w, r)
		return
	}

	// Загрузка HTML-шаблона из файла templates/index.html
	tmpl, err := template.ParseFiles("templates/index.html")
	// Проверка что запрошен именно корневой путь ("/")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Рендеринг шаблона в HTTP-ответ
	// Второй аргумент nil - не передаем данных в шаблон
	err = tmpl.Execute(w, nil)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}
