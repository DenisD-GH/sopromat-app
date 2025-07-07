// Функция для гарантированного включения нуля в область видимости
function ensureZeroVisible(min, max) {
    // Проверка на невалидные входные данные
    if (min === undefined || max === undefined) return {};
    
    // Вычисление диапазона значений и добавление 10% отступа
    const range = max - min;
    const padding = range * 0.1;
    
    let newMin = min;
    let newMax = max;
    
    // Если все значения положительные - расширяем вниз до нуля
    // Если все отрицательные - расширяем вверх до нуля
    // Если значения разнознаковые - расширяем в обе стороны. Исправить
    if (min > 0) {
        newMin = 0;
        newMax = max + padding;
    } else if (max < 0) {
        newMax = 0;
        newMin = min - padding;
    } else {
        newMin = min - padding;
        newMax = max + padding;
    }
    
    return { min: newMin, max: newMax };
}

// Функция для рисования жирной нулевой линии
function drawZeroLine(chart) {
    // Получение контекста рисования и осей
    const ctx = chart.ctx;
    const yAxis = chart.scales.y;
    const xAxis = chart.scales.x;

    // Определение позиции нуля по Y
    const zeroY = yAxis.getPixelForValue(0);
    
    // Настройка стилей и рисование горизонтальной линии через весь график
    ctx.save();
    ctx.beginPath();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#000000';
    ctx.moveTo(xAxis.left, zeroY);
    ctx.lineTo(xAxis.right, zeroY);
    ctx.stroke();
    ctx.restore();
}

// Функция для рисования балки с заделкой СПРАВА
function drawBeam(chart, beamLength) {
    // Получение параметров графика и вычисление центра
    const ctx = chart.ctx;
    const xAxis = chart.scales.x;
    const yAxis = chart.scales.y;
    
    // Центр по вертикали
    const centerY = (yAxis.top + yAxis.bottom) / 2;
    
    // Координаты начала и конца балки
    const startX = xAxis.getPixelForValue(0);
    const endX = xAxis.getPixelForValue(beamLength);
    
    // Рисуем балку
    ctx.save();
    ctx.beginPath();
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#2c3e50';
    ctx.moveTo(startX, centerY);
    ctx.lineTo(endX, centerY);
    ctx.stroke();
    ctx.restore();
    
    // Рисуем опору (заделку) СПРАВА
    const supportWidth = 20;
    ctx.save();
    ctx.strokeStyle = '#7f8c8d';
    ctx.lineWidth = 3;
    
    // Вертикальные линии заделки (справа)
    // 5 вертикальных линий справа от конца балки (потом исправить)
    // 2 горизонтальные линии сверху и снизу (потом исправить)
    for (let i = 0; i < 5; i++) {
        const xPos = endX + supportWidth - i * 5;
        ctx.beginPath();
        ctx.moveTo(xPos, centerY - 30);
        ctx.lineTo(xPos, centerY + 30);
        ctx.stroke();
    }
    
    // Горизонтальная линия заделки
    ctx.beginPath();
    ctx.moveTo(endX, centerY - 30);
    ctx.lineTo(endX + supportWidth, centerY - 30);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(endX, centerY + 30);
    ctx.lineTo(endX + supportWidth, centerY + 30);
    ctx.stroke();
    ctx.restore();
}

// Основная функция для построения эпюр
function drawDiagrams(points) {
    if (!points || points.length === 0) {
        console.error("Ошибка: данные для графиков (эпюр) отсутствуют");
        return;
    }

    // Определение длины балки по последней точке
    const beamLength = points.length > 0 ? points[points.length - 1].x : 0;

    // Подготовка данных
    // Метки по оси X (длина балки)
    // Данные для поперечных сил (Qy)
    // Данные для изгибающих моментов (Mx)
    const labels = points.map(p => p.x.toFixed(2));
    const qyData = points.map(p => p.qy);
    const mxData = points.map(p => p.mx);
    
    // Расчет диапазонов значений с обязательным включением нуля
    const qyMin = Math.min(...qyData);
    const qyMax = Math.max(...qyData);
    const qyRange = ensureZeroVisible(qyMin, qyMax);
    
    const mxMin = Math.min(...mxData);
    const mxMax = Math.max(...mxData);
    const mxRange = ensureZeroVisible(mxMin, mxMax);
    
    // Общие настройки
    // Адаптивность
    // Положение легенды
    // Формат подсказок
    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: { font: { size: 14 } }
            },
            tooltip: {
                callbacks: {
                    label: ctx => `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(2)}`
                }
            }
        }
    };
    
    // Плагин для нулевой линии
    const zeroLinePlugin = {
        id: 'zeroLine',
        afterDraw: drawZeroLine
    };
    
    // Плагин для рисования балки
    const beamPlugin = {
        id: 'beam',
        afterDraw: (chart) => {
            drawBeam(chart, beamLength);
        }
    };

    // Создаем схему балки
    new Chart(
        document.getElementById('beamDiagram'),
        {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    data: new Array(points.length).fill(0),
                    pointRadius: 0,
                    borderWidth: 0
                }]
            },
            options: {
                ...commonOptions,
                scales: {
                    x: {
                        min: 0,
                        max: beamLength,
                        title: {
                            display: true,
                            text: 'Расчётная схема балки',
                            font: { size: 16, weight: 'bold' }
                        },
                        grid: { display: false }
                    },
                    y: {
                        display: false,
                        min: -1,
                        max: 1
                    }
                },
                plugins: {
                    tooltip: { enabled: false },
                    legend: { display: false }
                }
            },
            plugins: [beamPlugin]
        }
    );
    
    // Создаем эпюру Qy
    new Chart(
        document.getElementById('qyChart'),
        {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Qy, кН',
                    data: qyData,
                    borderColor: 'red',
                    backgroundColor: 'rgba(255, 0, 0, 0.2)',
                    borderWidth: 2,
                    fill: {
                        target: 'origin',
                        above: 'rgba(255, 0, 0, 0.2)',
                        below: 'rgba(255, 0, 0, 0.2)'
                    },
                    tension: 0,
                    pointRadius: 0
                }]
            },
            options: {
                ...commonOptions,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Длина балки, м',
                            font: { size: 14, weight: 'bold' }
                        },
                        grid: { color: 'rgba(0, 0, 0, 0.1)' }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Qy, кН',
                            font: { size: 14, weight: 'bold' }
                        },
                        grid: { color: 'rgba(0, 0, 0, 0.1)' },
                        min: qyRange.min,
                        max: qyRange.max
                    }
                }
            },
            plugins: [zeroLinePlugin]
        }
    );
    
    // Создаем эпюру Mx
    new Chart(
        document.getElementById('mxChart'),
        {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Mx, кН·м',
                    data: mxData,
                    borderColor: 'blue',
                    backgroundColor: 'rgba(0, 0, 255, 0.2)',
                    borderWidth: 2,
                    fill: {
                        target: 'origin',
                        above: 'rgba(0, 0, 255, 0.2)',
                        below: 'rgba(0, 0, 255, 0.2)'
                    },
                    tension: 0,
                    pointRadius: 0
                }]
            },
            options: {
                ...commonOptions,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Длина балки, м',
                            font: { size: 14, weight: 'bold' }
                        },
                        grid: { color: 'rgba(0, 0, 0, 0.1)' }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Mx, кН·м',
                            font: { size: 14, weight: 'bold' }
                        },
                        grid: { color: 'rgba(0, 0, 0, 0.1)' },
                        min: mxRange.min,
                        max: mxRange.max
                    }
                }
            },
            plugins: [zeroLinePlugin]
        }
    );
}