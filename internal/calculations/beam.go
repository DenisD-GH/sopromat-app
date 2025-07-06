package calculations

import "sopromat/internal/models"

const pointsCount = 100 // Увеличим количество точек для гладких графиков

func CalculateBeam(input models.Input) models.Result {
	L, F, M, q := input.Length, input.Force, input.Moment, input.Load

	points := make([]models.PlotPoint, pointsCount)

	if L <= 0 {
		return models.Result{
			Points: []models.PlotPoint{},
		}
	}

	step := L / float64(pointsCount-1)

	// Расчёт значений в точках
	for i := 0; i < pointsCount; i++ {
		x := float64(i) * step
		Qy := -F - q*x
		Mx := M - F*x - 0.5*q*x*x

		points[i] = models.PlotPoint{
			X:  x,
			Qy: Qy,
			Mx: Mx,
		}
	}

	return models.Result{
		Q1:     -F,                  // Q в начале (x=0)
		Q2:     -F - q*L,            // Q в конце (x=L)
		M1:     M,                   // M в начале (x=0)
		M2:     M - F*L - 0.5*q*L*L, // M в конце (x=L)
		Points: points,
	}
}
