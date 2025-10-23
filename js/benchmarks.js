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
    
    // Initialize performance mode selector
    initPerformanceModeSelector();
    
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
        labels: ['Warzone', 'Fortnite', 'Valorant', 'CS2', 'Apex', 'Cyberpunk', 'RDR2'],
        data: [
            { label: 'Stock', values: [205, 245, 350, 325, 215, 155, 148], color: 'rgba(99, 102, 241, 1)' },
            { label: 'KiwiTweaks', values: [252, 298, 425, 392, 258, 184, 175], color: 'rgba(124, 58, 237, 1)' }
        ],
        yAxisLabel: 'FPS',
        title: 'Average FPS Across Games'
    });

    // Minimum FPS Chart
    createLineChart('minFpsChart', {
        labels: ['Warzone', 'Fortnite', 'Valorant', 'CS2', 'Apex', 'Cyberpunk', 'RDR2'],
        data: [
            { label: 'Stock', values: [158, 192, 265, 245, 165, 128, 122], color: 'rgba(99, 102, 241, 1)' },
            { label: 'KiwiTweaks', values: [202, 245, 338, 308, 208, 155, 149], color: 'rgba(124, 58, 237, 1)' }
        ],
        yAxisLabel: 'FPS',
        title: 'Minimum FPS Across Games'
    });

    // 1% Lows Chart
    createLineChart('onePercentLowChart', {
        labels: ['Warzone', 'Fortnite', 'Valorant', 'CS2', 'Apex', 'Cyberpunk', 'RDR2'],
        data: [
            { label: 'Stock', values: [145, 175, 238, 222, 152, 118, 114], color: 'rgba(99, 102, 241, 1)' },
            { label: 'KiwiTweaks', values: [185, 225, 302, 278, 192, 142, 138], color: 'rgba(124, 58, 237, 1)' }
        ],
        yAxisLabel: 'FPS',
        title: '1% Lows Across Games'
    });

    // CPU Usage Chart
    window.cpuChartInstance = createLineChart('cpuChart', {
        labels: ['Gaming (Average)'],
        data: [
            { label: 'Stock', values: [72], color: 'rgba(99, 102, 241, 1)' },
            { label: 'KiwiTweaks', values: [54], color: 'rgba(124, 58, 237, 1)' }
        ],
        yAxisLabel: 'CPU Usage (%)',
        title: 'CPU Usage Comparison'
    });

    // RAM Usage Chart
    window.ramChartInstance = createLineChart('ramChart', {
        labels: ['Gaming (Average)'],
        data: [
            { label: 'Stock', values: [68], color: 'rgba(99, 102, 241, 1)' },
            { label: 'KiwiTweaks', values: [45], color: 'rgba(124, 58, 237, 1)' }
        ],
        yAxisLabel: 'RAM Usage (%)',
        title: 'RAM Usage Comparison'
    });

    // I/O Performance Chart
    window.ioChartInstance = createLineChart('ioChart', {
        labels: ['Gaming (Average)'],
        data: [
            { label: 'Stock', values: [65], color: 'rgba(99, 102, 241, 1)' },
            { label: 'KiwiTweaks', values: [88], color: 'rgba(124, 58, 237, 1)' }
        ],
        yAxisLabel: 'Performance Score',
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
 * Initialize performance mode selector
 */
function initPerformanceModeSelector() {
    const performanceModeSelector = document.getElementById('performanceMode');
    if (!performanceModeSelector) return;
    
    performanceModeSelector.addEventListener('change', function() {
        updateSystemPerformanceCharts(this.value);
    });
    
    // Initial load
    updateSystemPerformanceCharts('gaming');
}

/**
 * Update system performance charts based on selected mode
 */
function updateSystemPerformanceCharts(mode) {
    const performanceData = {
        // System Scenarios
        idle: {
            cpu: { stock: 8, kiwi: 4 },
            ram: { stock: 28, kiwi: 18 },
            io: { stock: 15, kiwi: 22 },
            label: 'Idle State'
        },
        gaming: {
            cpu: { stock: 72, kiwi: 54 },
            ram: { stock: 68, kiwi: 45 },
            io: { stock: 65, kiwi: 88 },
            label: 'Gaming (Average)'
        },
        streaming: {
            cpu: { stock: 85, kiwi: 68 },
            ram: { stock: 78, kiwi: 58 },
            io: { stock: 72, kiwi: 92 },
            label: 'Streaming & Gaming'
        },
        multitasking: {
            cpu: { stock: 68, kiwi: 48 },
            ram: { stock: 82, kiwi: 62 },
            io: { stock: 78, kiwi: 95 },
            label: 'Multitasking'
        },
        heavy: {
            cpu: { stock: 92, kiwi: 72 },
            ram: { stock: 88, kiwi: 68 },
            io: { stock: 68, kiwi: 92 },
            label: 'Heavy Workload'
        },
        // Specific Games
        warzone: {
            cpu: { stock: 75, kiwi: 58 },
            ram: { stock: 72, kiwi: 52 },
            io: { stock: 68, kiwi: 90 },
            label: 'Call of Duty: Warzone'
        },
        fortnite: {
            cpu: { stock: 68, kiwi: 52 },
            ram: { stock: 65, kiwi: 48 },
            io: { stock: 70, kiwi: 88 },
            label: 'Fortnite'
        },
        valorant: {
            cpu: { stock: 62, kiwi: 45 },
            ram: { stock: 58, kiwi: 42 },
            io: { stock: 65, kiwi: 85 },
            label: 'Valorant'
        },
        cs2: {
            cpu: { stock: 70, kiwi: 54 },
            ram: { stock: 68, kiwi: 50 },
            io: { stock: 72, kiwi: 92 },
            label: 'Counter-Strike 2'
        },
        apex: {
            cpu: { stock: 78, kiwi: 60 },
            ram: { stock: 75, kiwi: 55 },
            io: { stock: 70, kiwi: 90 },
            label: 'Apex Legends'
        },
        cyberpunk: {
            cpu: { stock: 88, kiwi: 70 },
            ram: { stock: 85, kiwi: 65 },
            io: { stock: 75, kiwi: 95 },
            label: 'Cyberpunk 2077'
        }
    };
    
    const data = performanceData[mode] || performanceData.gaming;
    
    // Update CPU chart
    if (window.cpuChartInstance) {
        window.cpuChartInstance.data.labels = [data.label];
        window.cpuChartInstance.data.datasets[0].data = [data.cpu.stock];
        window.cpuChartInstance.data.datasets[1].data = [data.cpu.kiwi];
        window.cpuChartInstance.update();
    }
    
    // Update RAM chart
    if (window.ramChartInstance) {
        window.ramChartInstance.data.labels = [data.label];
        window.ramChartInstance.data.datasets[0].data = [data.ram.stock];
        window.ramChartInstance.data.datasets[1].data = [data.ram.kiwi];
        window.ramChartInstance.update();
    }
    
    // Update I/O chart
    if (window.ioChartInstance) {
        window.ioChartInstance.data.labels = [data.label];
        window.ioChartInstance.data.datasets[0].data = [data.io.stock];
        window.ioChartInstance.data.datasets[1].data = [data.io.kiwi];
        window.ioChartInstance.update();
    }
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
            cpu: 'AMD Ryzen 7 7800X3D',
            gpu: 'RTX 4070 Super',
            ram: '32GB DDR5',
            settings: {
                '1080p': { low: 285, medium: 235, high: 192, ultra: 165 },
                '1440p': { low: 225, medium: 185, high: 152, ultra: 128 },
                '4k': { low: 145, medium: 115, high: 92, ultra: 78 }
            },
            cpuTemp: 62,
            gpuTemp: 68,
            fpsImprovement: 32,
            cpuTempImprovement: -12,
            gpuTempImprovement: -8
        },
        fortnite: {
            title: 'Fortnite',
            cpu: 'AMD Ryzen 7 7800X3D',
            gpu: 'RTX 4070 Super',
            ram: '32GB DDR5',
            settings: {
                '1080p': { low: 385, medium: 315, high: 238, ultra: 195 },
                '1440p': { low: 295, medium: 245, high: 185, ultra: 152 },
                '4k': { low: 175, medium: 145, high: 115, ultra: 92 }
            },
            cpuTemp: 58,
            gpuTemp: 65,
            fpsImprovement: 28,
            cpuTempImprovement: -10,
            gpuTempImprovement: -7
        },
        valorant: {
            title: 'Valorant',
            cpu: 'AMD Ryzen 7 7800X3D',
            gpu: 'RTX 4070 Super',
            ram: '32GB DDR5',
            settings: {
                '1080p': { low: 485, medium: 425, high: 365, ultra: 325 },
                '1440p': { low: 445, medium: 385, high: 325, ultra: 285 },
                '4k': { low: 355, medium: 295, high: 245, ultra: 208 }
            },
            cpuTemp: 55,
            gpuTemp: 60,
            fpsImprovement: 26,
            cpuTempImprovement: -8,
            gpuTempImprovement: -5
        },
        cs2: {
            title: 'Counter-Strike 2',
            cpu: 'AMD Ryzen 7 7800X3D',
            gpu: 'RTX 4070 Super',
            ram: '32GB DDR5',
            settings: {
                '1080p': { low: 465, medium: 395, high: 332, ultra: 285 },
                '1440p': { low: 385, medium: 325, high: 275, ultra: 235 },
                '4k': { low: 245, medium: 198, high: 165, ultra: 138 }
            },
            cpuTemp: 59,
            gpuTemp: 64,
            fpsImprovement: 25,
            cpuTempImprovement: -9,
            gpuTempImprovement: -6
        },
        apex: {
            title: 'Apex Legends',
            cpu: 'AMD Ryzen 7 7800X3D',
            gpu: 'RTX 4070 Super',
            ram: '32GB DDR5',
            settings: {
                '1080p': { low: 275, medium: 225, high: 198, ultra: 168 },
                '1440p': { low: 218, medium: 185, high: 165, ultra: 142 },
                '4k': { low: 138, medium: 115, high: 95, ultra: 78 }
            },
            cpuTemp: 64,
            gpuTemp: 70,
            fpsImprovement: 28,
            cpuTempImprovement: -11,
            gpuTempImprovement: -9
        },
        cyberpunk: {
            title: 'Cyberpunk 2077',
            cpu: 'AMD Ryzen 7 7800X3D',
            gpu: 'RTX 4070 Super',
            ram: '32GB DDR5',
            settings: {
                '1080p': { low: 185, medium: 152, high: 124, ultra: 98 },
                '1440p': { low: 142, medium: 118, high: 95, ultra: 75 },
                '4k': { low: 85, medium: 68, high: 55, ultra: 42 }
            },
            cpuTemp: 68,
            gpuTemp: 75,
            fpsImprovement: 30,
            cpuTempImprovement: -10,
            gpuTempImprovement: -8
        },
        rdr2: {
            title: 'Red Dead Redemption 2',
            cpu: 'AMD Ryzen 7 7800X3D',
            gpu: 'RTX 4070 Super',
            ram: '32GB DDR5',
            settings: {
                '1080p': { low: 165, medium: 138, high: 115, ultra: 92 },
                '1440p': { low: 128, medium: 105, high: 88, ultra: 72 },
                '4k': { low: 78, medium: 62, high: 52, ultra: 42 }
            },
            cpuTemp: 66,
            gpuTemp: 73,
            fpsImprovement: 31,
            cpuTempImprovement: -9,
            gpuTempImprovement: -7
        },
        gta5: {
            title: 'GTA V',
            cpu: 'AMD Ryzen 7 7800X3D',
            gpu: 'RTX 4070 Super',
            ram: '32GB DDR5',
            settings: {
                '1080p': { low: 315, medium: 268, high: 225, ultra: 195 },
                '1440p': { low: 245, medium: 208, high: 175, ultra: 148 },
                '4k': { low: 155, medium: 128, high: 105, ultra: 88 }
            },
            cpuTemp: 60,
            gpuTemp: 67,
            fpsImprovement: 27,
            cpuTempImprovement: -8,
            gpuTempImprovement: -6
        },
        overwatch: {
            title: 'Overwatch 2',
            cpu: 'AMD Ryzen 7 7800X3D',
            gpu: 'RTX 4070 Super',
            ram: '32GB DDR5',
            settings: {
                '1080p': { low: 395, medium: 335, high: 285, ultra: 245 },
                '1440p': { low: 315, medium: 268, high: 228, ultra: 195 },
                '4k': { low: 195, medium: 165, high: 138, ultra: 115 }
            },
            cpuTemp: 57,
            gpuTemp: 63,
            fpsImprovement: 29,
            cpuTempImprovement: -9,
            gpuTempImprovement: -6
        },
        minecraft: {
            title: 'Minecraft (Modded)',
            cpu: 'AMD Ryzen 7 7800X3D',
            gpu: 'RTX 4070 Super',
            ram: '32GB DDR5',
            settings: {
                '1080p': { low: 445, medium: 385, high: 325, ultra: 275 },
                '1440p': { low: 365, medium: 315, high: 265, ultra: 225 },
                '4k': { low: 245, medium: 205, high: 172, ultra: 145 }
            },
            cpuTemp: 54,
            gpuTemp: 58,
            fpsImprovement: 35,
            cpuTempImprovement: -12,
            gpuTempImprovement: -8
        }
    };
    
    // Store current settings
    let currentSettings = {
        game: 'warzone',
        resolution: '1440p',
        quality: 'medium'
    };
    
    // Function to update display based on current settings
    function updateGameDisplay() {
        const game = gameData[currentSettings.game];
        if (!game) return;
        
        const fps = game.settings[currentSettings.resolution][currentSettings.quality];
        const minFps = Math.floor(fps * 0.7); // Approximate min FPS
        
        // Update game info
        document.getElementById('gameTitle').textContent = game.title;
        document.getElementById('gameCpu').textContent = game.cpu;
        document.getElementById('gameGpu').textContent = game.gpu;
        document.getElementById('gameRam').textContent = game.ram;
        
        // Update stats with animation
        animateValue('avgFps', 0, fps, 1000);
        animateValue('minFps', 0, minFps, 1000);
        document.getElementById('cpuTemp').innerHTML = game.cpuTemp + '<small>°C</small>';
        document.getElementById('gpuTemp').innerHTML = game.gpuTemp + '<small>°C</small>';
        
        // Update improvement indicators
        updateImprovement('avgFps', game.fpsImprovement);
        updateImprovement('minFps', Math.floor(game.fpsImprovement * 1.2));
        updateImprovement('cpuTemp', game.cpuTempImprovement);
        updateImprovement('gpuTemp', game.gpuTempImprovement);
        
        // Update charts
        updateGameCharts(currentSettings.game, currentSettings.resolution, currentSettings.quality);
    }
    
    // Game selector change
    gameSelector.addEventListener('change', function() {
        currentSettings.game = this.value;
        updateGameDisplay();
    });
    
    // Resolution selector change
    const resolutionSelector = document.getElementById('resolution');
    if (resolutionSelector) {
        resolutionSelector.value = '1440p'; // Set default
        resolutionSelector.addEventListener('change', function() {
            currentSettings.resolution = this.value;
            updateGameDisplay();
        });
    }
    
    // Quality selector change
    const qualitySelector = document.getElementById('quality');
    if (qualitySelector) {
        qualitySelector.addEventListener('change', function() {
            currentSettings.quality = this.value;
            updateGameDisplay();
        });
    }
    
    // Trigger initial update
    updateGameDisplay();
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
 * Update game charts based on selected game and settings
 */
function updateGameCharts(game, resolution, quality) {
    // Define full game data with settings-based values
    const fullGameData = {
        warzone: {
            settings: {
                '1080p': { low: 285, medium: 235, high: 192, ultra: 165 },
                '1440p': { low: 225, medium: 185, high: 152, ultra: 128 },
                '4k': { low: 145, medium: 115, high: 92, ultra: 78 }
            }
        },
        fortnite: {
            settings: {
                '1080p': { low: 385, medium: 315, high: 238, ultra: 195 },
                '1440p': { low: 295, medium: 245, high: 185, ultra: 152 },
                '4k': { low: 175, medium: 145, high: 115, ultra: 92 }
            }
        },
        valorant: {
            settings: {
                '1080p': { low: 485, medium: 425, high: 365, ultra: 325 },
                '1440p': { low: 445, medium: 385, high: 325, ultra: 285 },
                '4k': { low: 355, medium: 295, high: 245, ultra: 208 }
            }
        },
        cs2: {
            settings: {
                '1080p': { low: 465, medium: 395, high: 332, ultra: 285 },
                '1440p': { low: 385, medium: 325, high: 275, ultra: 235 },
                '4k': { low: 245, medium: 198, high: 165, ultra: 138 }
            }
        },
        apex: {
            settings: {
                '1080p': { low: 275, medium: 225, high: 198, ultra: 168 },
                '1440p': { low: 218, medium: 185, high: 165, ultra: 142 },
                '4k': { low: 138, medium: 115, high: 95, ultra: 78 }
            }
        },
        cyberpunk: {
            settings: {
                '1080p': { low: 185, medium: 152, high: 124, ultra: 98 },
                '1440p': { low: 142, medium: 118, high: 95, ultra: 75 },
                '4k': { low: 85, medium: 68, high: 55, ultra: 42 }
            }
        },
        rdr2: {
            settings: {
                '1080p': { low: 165, medium: 138, high: 115, ultra: 92 },
                '1440p': { low: 128, medium: 105, high: 88, ultra: 72 },
                '4k': { low: 78, medium: 62, high: 52, ultra: 42 }
            }
        },
        gta5: {
            settings: {
                '1080p': { low: 315, medium: 268, high: 225, ultra: 195 },
                '1440p': { low: 245, medium: 208, high: 175, ultra: 148 },
                '4k': { low: 155, medium: 128, high: 105, ultra: 88 }
            }
        },
        overwatch: {
            settings: {
                '1080p': { low: 395, medium: 335, high: 285, ultra: 245 },
                '1440p': { low: 315, medium: 268, high: 228, ultra: 195 },
                '4k': { low: 195, medium: 165, high: 138, ultra: 115 }
            }
        },
        minecraft: {
            settings: {
                '1080p': { low: 445, medium: 385, high: 325, ultra: 275 },
                '1440p': { low: 365, medium: 315, high: 265, ultra: 225 },
                '4k': { low: 245, medium: 205, high: 172, ultra: 145 }
            }
        }
    };
    
    const gameInfo = fullGameData[game] || fullGameData.warzone;
    const stockFps = Math.floor(gameInfo.settings[resolution][quality] / 1.32); // Approximate stock FPS
    const kiwiTweaksFps = gameInfo.settings[resolution][quality];
    const stockLows = Math.floor(stockFps * 0.7);
    const kiwiTweaksLows = Math.floor(kiwiTweaksFps * 0.7);
    
    // Update FPS chart
    if (window.gameFpsChart) {
        window.gameFpsChart.data.datasets[0].data = [stockFps, kiwiTweaksFps];
        window.gameFpsChart.update('none'); // Update without animation for smooth transitions
    }
    
    // Update 1% lows chart
    if (window.gameLowsChart) {
        window.gameLowsChart.data.datasets[0].data = [stockLows, kiwiTweaksLows];
        window.gameLowsChart.update('none');
    }
    
    // Update usage chart with dynamic values based on performance
    if (window.usageChart) {
        const cpuUsageStock = Math.min(95, Math.floor(85 + (300 - kiwiTweaksFps) / 10));
        const cpuUsageKiwi = Math.floor(cpuUsageStock * 0.75);
        const gpuUsageStock = Math.min(98, Math.floor(88 + (300 - kiwiTweaksFps) / 12));
        const gpuUsageKiwi = Math.floor(gpuUsageStock * 0.78);
        const ramUsageStock = Math.min(85, Math.floor(75 + (300 - kiwiTweaksFps) / 15));
        const ramUsageKiwi = Math.floor(ramUsageStock * 0.65);
        
        window.usageChart.data.datasets[0].data = [cpuUsageStock, gpuUsageStock, ramUsageStock];
        window.usageChart.data.datasets[1].data = [cpuUsageKiwi, gpuUsageKiwi, ramUsageKiwi];
        window.usageChart.update('none');
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

/**
 * Animate stat counters
 */
function animateStatCounters() {
    const statValues = document.querySelectorAll('[data-count]');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                entry.target.classList.add('counted');
                const counter = entry.target.querySelector('.counter');
                const target = parseInt(entry.target.getAttribute('data-count'));
                
                animateCounter(counter, 0, target, 2000);
            }
        });
    }, { threshold: 0.5 });
    
    statValues.forEach(stat => observer.observe(stat));
}

/**
 * Animate counter element
 */
function animateCounter(element, start, end, duration) {
    if (!element) return;
    
    const range = end - start;
    const minFrameTime = 30;
    const totalFrames = Math.ceil(duration / minFrameTime);
    let frame = 0;
    
    const timer = setInterval(() => {
        frame++;
        const progress = frame / totalFrames;
        const current = Math.floor(start + (range * progress));
        
        element.textContent = current;
        
        if (frame === totalFrames) {
            clearInterval(timer);
            element.textContent = end; // Ensure exact end value
        }
    }, minFrameTime);
}

// Initialize stat counter animations
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', animateStatCounters);
} else {
    animateStatCounters();
}

// Make functions available globally
window.initBenchmarkCharts = initBenchmarkCharts;
