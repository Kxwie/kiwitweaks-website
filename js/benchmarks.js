/**
 * Benchmarks Page JavaScript
 * Handles all interactive elements and charts for the benchmarks page
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize benchmark charts
    if (document.getElementById('fpsChart')) {
        initBenchmarkCharts();
    }
    
    // Initialize tab functionality
    initBenchmarkTabs();
    
    // Initialize game selector
    initGameSelector();
    
    // Initialize tooltips
    initTooltips();
    
    // Initialize animations
    initAnimations();
});

/**
 * Initialize benchmark charts using Chart.js
 */
function initBenchmarkCharts() {
    // FPS Comparison Chart (Hero Section)
    const fpsCtx = document.getElementById('fpsComparisonChart').getContext('2d');
    new Chart(fpsCtx, {
        type: 'bar',
        data: {
            labels: ['Stock Windows', 'With KiwiTweaks', 'Improvement'],
            datasets: [{
                label: 'Average FPS',
                data: [100, 130, 30],
                backgroundColor: [
                    'rgba(99, 102, 241, 0.7)',
                    'rgba(124, 58, 237, 0.9)',
                    'rgba(16, 185, 129, 0.9)'
                ],
                borderColor: [
                    'rgba(99, 102, 241, 1)',
                    'rgba(124, 58, 237, 1)',
                    'rgba(16, 185, 129, 1)'
                ],
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.raw} FPS`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Frames Per Second (FPS)'
                    }
                }
            },
            animation: {
                duration: 1500,
                easing: 'easeOutQuart'
            }
        }
    });

    // Main FPS Chart
    createLineChart('fpsChart', {
        labels: ['Game 1', 'Game 2', 'Game 3', 'Game 4', 'Game 5', 'Game 6', 'Game 7'],
        data: [
            { label: 'Stock', values: [85, 90, 78, 92, 88, 95, 82], color: 'rgba(99, 102, 241, 1)' },
            { label: 'KiwiTweaks', values: [110, 115, 105, 120, 112, 118, 108], color: 'rgba(124, 58, 237, 1)' }
        ],
        yAxisLabel: 'FPS',
        title: 'Average FPS Across Games'
    });

    // Minimum FPS Chart
    createLineChart('minFpsChart', {
        labels: ['Game 1', 'Game 2', 'Game 3', 'Game 4', 'Game 5', 'Game 6', 'Game 7'],
        data: [
            { label: 'Stock', values: [65, 70, 58, 72, 68, 75, 62], color: 'rgba(99, 102, 241, 1)' },
            { label: 'KiwiTweaks', values: [95, 100, 90, 105, 97, 103, 93], color: 'rgba(124, 58, 237, 1)' }
        ],
        yAxisLabel: 'FPS',
        title: 'Minimum FPS Across Games'
    });

    // 1% Lows Chart
    createLineChart('onePercentLowChart', {
        labels: ['Game 1', 'Game 2', 'Game 3', 'Game 4', 'Game 5', 'Game 6', 'Game 7'],
        data: [
            { label: 'Stock', values: [60, 65, 55, 68, 63, 70, 58], color: 'rgba(99, 102, 241, 1)' },
            { label: 'KiwiTweaks', values: [90, 95, 85, 98, 92, 97, 88], color: 'rgba(124, 58, 237, 1)' }
        ],
        yAxisLabel: 'FPS',
        title: '1% Lows Across Games'
    });

    // CPU Usage Chart
    createLineChart('cpuChart', {
        labels: ['Idle', 'Gaming', 'Streaming', 'Multitasking', 'Heavy Load'],
        data: [
            { label: 'Stock', values: [8, 85, 92, 78, 95], color: 'rgba(99, 102, 241, 1)' },
            { label: 'KiwiTweaks', values: [5, 65, 72, 58, 75], color: 'rgba(124, 58, 237, 1)' }
        ],
        yAxisLabel: 'CPU Usage (%)',
        title: 'CPU Usage Comparison'
    });

    // RAM Usage Chart
    createLineChart('ramChart', {
        labels: ['Idle', 'Gaming', 'Streaming', 'Multitasking', 'Heavy Load'],
        data: [
            { label: 'Stock', values: [35, 75, 82, 88, 92], color: 'rgba(99, 102, 241, 1)' },
            { label: 'KiwiTweaks', values: [25, 55, 62, 68, 72], color: 'rgba(124, 58, 237, 1)' }
        ],
        yAxisLabel: 'RAM Usage (%)',
        title: 'RAM Usage Comparison'
    });

    // I/O Performance Chart
    createLineChart('ioChart', {
        labels: ['Read Speed', 'Write Speed', 'Latency', '4K Random', 'Access Time'],
        data: [
            { label: 'Stock', values: [2500, 1800, 12, 45, 0.15], color: 'rgba(99, 102, 241, 1)' },
            { label: 'KiwiTweaks', values: [3200, 2400, 8, 65, 0.08], color: 'rgba(124, 58, 237, 1)' }
        ],
        yAxisLabel: 'Performance',
        title: 'I/O Performance Comparison',
        isPercentage: false
    });

    // Game-specific charts
    initGameCharts();
}

/**
 * Create a line chart with the given configuration
 */
function createLineChart(canvasId, config) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    const datasets = config.data.map(item => ({
        label: item.label,
        data: item.values,
        borderColor: item.color,
        backgroundColor: item.color.replace('1)', '0.1)'),
        borderWidth: 2,
        tension: 0.3,
        fill: true,
        pointBackgroundColor: '#fff',
        pointBorderColor: item.color,
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
    }));

    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: config.labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: !!config.title,
                    text: config.title,
                    font: {
                        size: 16,
                        weight: '600'
                    },
                    padding: {
                        bottom: 10
                    }
                },
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: {
                            size: 13
                        }
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleFont: {
                        size: 14,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 13
                    },
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += config.isPercentage ? `${context.parsed.y}%` : context.parsed.y;
                                if (config.yAxisLabel === 'FPS') {
                                    label += ' FPS';
                                } else if (config.yAxisLabel === 'MB/s' && !isNaN(context.parsed.y)) {
                                    label += ' MB/s';
                                } else if (config.yAxisLabel === 'ms' && !isNaN(context.parsed.y)) {
                                    label += ' ms';
                                }
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: config.beginAtZero !== false,
                    title: {
                        display: true,
                        text: config.yAxisLabel,
                        font: {
                            size: 12,
                            weight: '600'
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            },
            animation: {
                duration: 1000,
                easing: 'easeOutQuart'
            }
        }
    });
}

/**
 * Initialize benchmark tabs
 */
function initBenchmarkTabs() {
    const tabs = document.querySelectorAll('.benchmark-tab');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabGroup = this.closest('.benchmark-tabs');
            const category = this.closest('.benchmark-category');
            const targetId = this.getAttribute('data-tab');
            
            // Update active tab
            tabGroup.querySelectorAll('.benchmark-tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Show corresponding content
            if (category) {
                const charts = category.querySelectorAll('.benchmark-chart');
                charts.forEach(chart => chart.classList.add('hidden'));
                
                const targetChart = category.querySelector(`#${targetId}`);
                if (targetChart) {
                    targetChart.classList.remove('hidden');
                }
            }
        });
    });
}

/**
 * Initialize game selector
 */
function initGameSelector() {
    const gameSelector = document.getElementById('gameSelector');
    if (!gameSelector) return;
    
    const gameData = {
        warzone: {
            title: 'Call of Duty: Warzone',
            cpu: 'i5-9600K',
            gpu: 'RTX 2060',
            ram: '16GB DDR4',
            avgFps: 142,
            minFps: 98,
            cpuTemp: 68,
            gpuTemp: 72,
            fpsImprovement: 32,
            minFpsImprovement: 45,
            cpuTempImprovement: -12,
            gpuTempImprovement: -8
        },
        fortnite: {
            title: 'Fortnite',
            cpu: 'i5-9600K',
            gpu: 'RTX 2060',
            ram: '16GB DDR4',
            avgFps: 165,
            minFps: 120,
            cpuTemp: 65,
            gpuTemp: 70,
            fpsImprovement: 28,
            minFpsImprovement: 40,
            cpuTempImprovement: -10,
            gpuTempImprovement: -7
        },
        valorant: {
            title: 'Valorant',
            cpu: 'i5-9600K',
            gpu: 'RTX 2060',
            ram: '16GB DDR4',
            avgFps: 280,
            minFps: 210,
            cpuTemp: 62,
            gpuTemp: 65,
            fpsImprovement: 22,
            minFpsImprovement: 35,
            cpuTempImprovement: -8,
            gpuTempImprovement: -5
        },
        cs2: {
            title: 'Counter-Strike 2',
            cpu: 'i5-9600K',
            gpu: 'RTX 2060',
            ram: '16GB DDR4',
            avgFps: 250,
            minFps: 190,
            cpuTemp: 64,
            gpuTemp: 68,
            fpsImprovement: 25,
            minFpsImprovement: 38,
            cpuTempImprovement: -9,
            gpuTempImprovement: -6
        },
        apex: {
            title: 'Apex Legends',
            cpu: 'i5-9600K',
            gpu: 'RTX 2060',
            ram: '16GB DDR4',
            avgFps: 135,
            minFps: 95,
            cpuTemp: 70,
            gpuTemp: 74,
            fpsImprovement: 30,
            minFpsImprovement: 42,
            cpuTempImprovement: -11,
            gpuTempImprovement: -9
        }
    };
    
    // Update game data when selection changes
    gameSelector.addEventListener('change', function() {
        const game = gameData[this.value];
        if (!game) return;
        
        // Update game info
        document.getElementById('gameTitle').textContent = game.title;
        document.getElementById('gameCpu').textContent = game.cpu;
        document.getElementById('gameGpu').textContent = game.gpu;
        document.getElementById('gameRam').textContent = game.ram;
        
        // Update stats with animation
        animateValue('avgFps', 0, game.avgFps, 1000);
        animateValue('minFps', 0, game.minFps, 1000);
        document.getElementById('cpuTemp').innerHTML = game.cpuTemp + '<small>°C</small>';
        document.getElementById('gpuTemp').innerHTML = game.gpuTemp + '<small>°C</small>';
        
        // Update improvement indicators
        updateImprovement('avgFps', game.fpsImprovement);
        updateImprovement('minFps', game.minFpsImprovement);
        updateImprovement('cpuTemp', game.cpuTempImprovement);
        updateImprovement('gpuTemp', game.gpuTempImprovement);
        
        // Update charts
        updateGameCharts(this.value);
    });
    
    // Trigger initial update
    gameSelector.dispatchEvent(new Event('change'));
}

/**
 * Animate a numeric value
 */
function animateValue(elementId, start, end, duration) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const range = end - start;
    const minFrameTime = 30; // 30ms per frame
    const totalFrames = Math.ceil(duration / minFrameTime);
    let frame = 0;
    
    const counter = setInterval(() => {
        frame++;
        const progress = frame / totalFrames;
        const current = Math.floor(start + (range * progress));
        
        element.textContent = current;
        
        if (frame === totalFrames) {
            clearInterval(counter);
        }
    }, minFrameTime);
}

/**
 * Update improvement indicator
 */
function updateImprovement(elementId, value) {
    const element = document.getElementById(elementId).parentElement.querySelector('.stat-change');
    if (!element) return;
    
    element.textContent = value > 0 ? `+${value}%` : `${value}%`;
    element.className = 'stat-change ' + (value > 0 ? 'positive' : 'negative');
}

/**
 * Initialize game-specific charts
 */
function initGameCharts() {
    // FPS Chart
    const fpsCtx = document.getElementById('gameFpsChart').getContext('2d');
    window.gameFpsChart = createLineChart('gameFpsChart', {
        labels: ['Stock', 'KiwiTweaks'],
        data: [
            { label: 'Average FPS', values: [100, 132], color: 'rgba(124, 58, 237, 1)' }
        ],
        yAxisLabel: 'FPS',
        beginAtZero: true
    });
    
    // 1% Lows Chart
    const lowsCtx = document.getElementById('gameLowsChart').getContext('2d');
    window.gameLowsChart = createLineChart('gameLowsChart', {
        labels: ['Stock', 'KiwiTweaks'],
        data: [
            { label: '1% Lows', values: [68, 98], color: 'rgba(16, 185, 129, 1)' }
        ],
        yAxisLabel: 'FPS',
        beginAtZero: true
    });
    
    // CPU/GPU Usage Chart
    const usageCtx = document.getElementById('gameUsageChart').getContext('2d');
    window.usageChart = new Chart(usageCtx, {
        type: 'bar',
        data: {
            labels: ['CPU Usage', 'GPU Usage', 'RAM Usage'],
            datasets: [
                {
                    label: 'Stock',
                    data: [85, 90, 75],
                    backgroundColor: 'rgba(99, 102, 241, 0.7)',
                    borderColor: 'rgba(99, 102, 241, 1)',
                    borderWidth: 1,
                    borderRadius: 4
                },
                {
                    label: 'KiwiTweaks',
                    data: [65, 70, 55],
                    backgroundColor: 'rgba(124, 58, 237, 0.7)',
                    borderColor: 'rgba(124, 58, 237, 1)',
                    borderWidth: 1,
                    borderRadius: 4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: {
                            size: 13
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.raw}%`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Usage (%)'
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeOutQuart'
            }
        }
    });
}

/**
 * Update game charts based on selected game
 */
function updateGameCharts(game) {
    const gameData = {
        warzone: {
            fps: [100, 132],
            lows: [68, 98],
            usage: [
                [85, 90, 75],
                [65, 70, 55]
            ]
        },
        fortnite: {
            fps: [120, 154],
            lows: [85, 119],
            usage: [
                [80, 85, 70],
                [60, 65, 50]
            ]
        },
        valorant: {
            fps: [220, 280],
            lows: [150, 210],
            usage: [
                [70, 75, 65],
                [55, 60, 50]
            ]
        },
        cs2: {
            fps: [200, 250],
            lows: [140, 190],
            usage: [
                [75, 80, 70],
                [60, 65, 55]
            ]
        },
        apex: {
            fps: [105, 135],
            lows: [70, 95],
            usage: [
                [82, 88, 78],
                [62, 68, 58]
            ]
        }
    };
    
    const data = gameData[game] || gameData.warzone;
    
    // Update FPS chart
    if (window.gameFpsChart) {
        window.gameFpsChart.data.datasets[0].data = data.fps;
        window.gameFpsChart.update();
    }
    
    // Update 1% lows chart
    if (window.gameLowsChart) {
        window.gameLowsChart.data.datasets[0].data = data.lows;
        window.gameLowsChart.update();
    }
    
    // Update usage chart
    if (window.usageChart) {
        window.usageChart.data.datasets[0].data = data.usage[0];
        window.usageChart.data.datasets[1].data = data.usage[1];
        window.usageChart.update();
    }
}

/**
 * Initialize tooltips
 */
function initTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

/**
 * Initialize animations
 */
function initAnimations() {
    // Add animation classes to elements when they come into view
    const animateOnScroll = function() {
        const elements = document.querySelectorAll('.animate-on-scroll');
        
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const screenPosition = window.innerHeight / 1.2;
            
            if (elementPosition < screenPosition) {
                element.classList.add('animated');
            }
        });
    };
    
    // Run on scroll
    window.addEventListener('scroll', animateOnScroll);
    
    // Run once on load
    animateOnScroll();
}

// Make functions available globally
window.initBenchmarkCharts = initBenchmarkCharts;
