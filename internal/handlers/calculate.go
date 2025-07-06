package handlers

import (
	"encoding/json"
	"html/template"
	"net/http"
	"sopromat/internal/calculations"
	"sopromat/internal/models"
	"strconv"
)

func Calculate(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Redirect(w, r, "/", http.StatusSeeOther)
		return
	}

	// Парсинг данных формы
	err := r.ParseForm()
	if err != nil {
		http.Error(w, "Ошибка обработки формы", http.StatusBadRequest)
		return
	}

	// Преобразование строк в числа
	length, _ := strconv.ParseFloat(r.FormValue("length"), 64)
	force, _ := strconv.ParseFloat(r.FormValue("force"), 64)
	moment, _ := strconv.ParseFloat(r.FormValue("moment"), 64)
	load, _ := strconv.ParseFloat(r.FormValue("load"), 64)

	// Создание входной структуры
	input := models.Input{
		Length: length,
		Force:  force,
		Moment: moment,
		Load:   load,
	}

	// Выполнение расчётов
	result := calculations.CalculateBeam(input)

	// Преобразуем точки в JSON
	pointsJSON, err := json.Marshal(result.Points)
	if err != nil {
		http.Error(w, "Ошибка генерации данных графиков", http.StatusInternalServerError)
		return
	}

	// Создаем структуру для шаблона
	templateData := struct {
		Result     models.Result
		PointsJSON template.JS // Используем специальный тип для JS
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
