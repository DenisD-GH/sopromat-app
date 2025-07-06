// Функция для гарантированного включения нуля в область видимости
function ensureZeroVisible(min, max) {
    if (min === undefined || max === undefined) return {};
    
    const range = max - min;
    const padding = range * 0.1;
    
    let newMin = min;
    let newMax = max;
    
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

// Функция для рисования нулевой линии
function drawZeroLine(chart) {
    const ctx = chart.ctx;
    const yAxis = chart.scales.y;
    const xAxis = chart.scales.x;
    
    const zeroY = yAxis.getPixelForValue(0);
    
    ctx.save();
    ctx.beginPath();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#000000';
    ctx.moveTo(xAxis.left, zeroY);
    ctx.lineTo(xAxis.right, zeroY);
    ctx.stroke();
    ctx.restore();
}

// Основная функция для построения диаграмм
function drawDiagrams(points) {
    if (!points || points.length === 0) {
        console.error("Ошибка: данные для графиков отсутствуют");
        return;
    }

    // Подготовка данных
    const labels = points.map(p => p.x.toFixed(2));
    const qyData = points.map(p => p.qy);
    const mxData = points.map(p => p.mx);
    
    // Определение диапазонов
    const qyMin = Math.min(...qyData);
    const qyMax = Math.max(...qyData);
    const qyRange = ensureZeroVisible(qyMin, qyMax);
    
    const mxMin = Math.min(...mxData);
    const mxMax = Math.max(...mxData);
    const mxRange = ensureZeroVisible(mxMin, mxMax);
    
    // Общие настройки
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