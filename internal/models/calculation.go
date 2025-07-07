package models

// Данные точки эпюры
type PlotPoint struct {
	X  float64 `json:"x"`  // Координата по длине балки. Переименовать на z
	Qy float64 `json:"qy"` // Значение поперечной силы
	Mx float64 `json:"mx"` // Значение изгибающего момента
}

// Входные параметры балки
type Input struct {
	Length float64 `json:"length"` // Длина балки (L)
	Force  float64 `json:"force"`  // Сосредоточенная сила (F)
	Moment float64 `json:"moment"` // Сосредоточенный момент (M)
	Load   float64 `json:"load"`   // Распределённая нагрузка (q)
}

// Результаты расчёта
type Result struct {
	Q1     float64     `json:"q1"`     // Поперечная сила в начале участка
	Q2     float64     `json:"q2"`     // Поперечная сила в конце участка
	M1     float64     `json:"m1"`     // Изгибающий момент в начале участка
	M2     float64     `json:"m2"`     // Изгибающий момент в конце участка
	Points []PlotPoint `json:"points"` // Точки для построения эпюр
}
