package main

import (
	"fmt"
	"log"
	"net/http"
	"sopromat/internal/handlers"
)

func main() {
	// Регистрация обработчиков
	http.HandleFunc("/", handlers.Home)
	http.HandleFunc("/calculate", handlers.Calculate)

	// Обслуживание статических файлов
	fs := http.FileServer(http.Dir("static"))
	http.Handle("/static/", http.StripPrefix("/static/", fs))

	// Запуск сервера
	fmt.Println("Сервер запущен на http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
