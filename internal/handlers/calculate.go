// обработчик расчетов

package handlers

import (
	"encoding/json"
	"html/template"
	"net/http"
	"sopromat/internal/calculations"
	"sopromat/internal/models"
	"strconv"
)

// Объявление обработчика для пути "/calculate"
func Calculate(w http.ResponseWriter, r *http.Request) {
	// Проверка метода запроса (должен быть POST)
	if r.Method != http.MethodPost {
		// Если метод не POST - перенаправляем на главную страницу
		http.Redirect(w, r, "/", http.StatusSeeOther)
		return
	}

	// Парсинг данных формы
	err := r.ParseForm()
	if err != nil {
		http.Error(w, "Ошибка обработки формы", http.StatusBadRequest)
		return
	}

	// Получение значений из формы и преобразование в float64
	// Игнорируются ошибки преобразования. Нужно добавлять проверку ошибок!
	length, _ := strconv.ParseFloat(r.FormValue("length"), 64)
	force, _ := strconv.ParseFloat(r.FormValue("force"), 64)
	moment, _ := strconv.ParseFloat(r.FormValue("moment"), 64)
	load, _ := strconv.ParseFloat(r.FormValue("load"), 64)

	// Создание входной структуры с данными из формы
	input := models.Input{
		Length: length,
		Force:  force,
		Moment: moment,
		Load:   load,
	}

	// Выполнение расчётов с использованием функции расчета из пакета calculations
	result := calculations.CalculateBeam(input)

	// Преобразование точек для графиков в JSON
	pointsJSON, err := json.Marshal(result.Points)
	if err != nil {
		http.Error(w, "Ошибка генерации данных графиков", http.StatusInternalServerError)
		return
	}

	// Создание структуры данных для шаблона
	// template.JS - специальный тип для безопасной вставки JavaScriptS (заменить?)
	templateData := struct {
		Result     models.Result
		PointsJSON template.JS // Специальный тип для JS
	}{
		Result:     result,
		PointsJSON: template.JS(pointsJSON), // Безопасная передача JS
	}

	// Загрузка шаблона результатов
	tmpl, err := template.ParseFiles("templates/result.html")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Рендеринг результатов
	err = tmpl.Execute(w, templateData)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}
