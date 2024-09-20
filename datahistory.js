document.addEventListener('DOMContentLoaded', async () => {
    const ctx = document.getElementById('myChart').getContext('2d');

    const countryNames = {
        'at': 'Austria',
        'be': 'Belgium',
        'bg': 'Bulgaria',
        'cy': 'Cyprus',
        'cz': 'Czech Republic',
        'de': 'Germany',
        'dk': 'Denmark',
        'ee': 'Estonia',
        'gr': 'Greece',
        'es': 'Spain',
        'fi': 'Finland',
        'fr': 'France',
        'hr': 'Croatia',
        'hu': 'Hungary',
        'ie': 'Ireland',
        'it': 'Italy',
        'lt': 'Lithuania',
        'lu': 'Luxembourg',
        'lv': 'Latvia',
        'mt': 'Malta',
        'nl': 'Netherlands',
        'pl': 'Poland',
        'pt': 'Portugal',
        'ro': 'Romania',
        'se': 'Sweden',
        'si': 'Slovenia',
        'sk': 'Slovakia'
    };

    const countryFlags = {
        'at': '🇦🇹',
        'be': '🇧🇪',
        'bg': '🇧🇬',
        'cy': '🇨🇾',
        'cz': '🇨🇿',
        'de': '🇩🇪',
        'dk': '🇩🇰',
        'ee': '🇪🇪',
        'gr': '🇬🇷',
        'es': '🇪🇸',
        'fi': '🇫🇮',
        'fr': '🇫🇷',
        'hr': '🇭🇷',
        'hu': '🇭🇺',
        'ie': '🇮🇪',
        'it': '🇮🇹',
        'lt': '🇱🇹',
        'lu': '🇱🇺',
        'lv': '🇱🇻',
        'mt': '🇲🇹',
        'nl': '🇳🇱',
        'pl': '🇵🇱',
        'pt': '🇵🇹',
        'ro': '🇷🇴',
        'se': '🇸🇪',
        'si': '🇸🇮',
        'sk': '🇸🇰'
    };

    let usePercentage = false;
    const colors = {};

    try {
        const response = await fetch('https://stopkillinggameshistoric-3a5f498bc1f0.herokuapp.com/historic-data');
        let data = await response.json();

        // Sort data by timestamp
        data.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        const countries = {};
        data.forEach(entry => {
            entry.data.forEach(countryData => {
                const { countryCode, totalCount, percentage } = countryData;
                if (!countries[countryCode]) {
                    countries[countryCode] = [];
                    colors[countryCode] = getRandomColor();
                }
                countries[countryCode].push({
                    timestamp: entry.timestamp,
                    totalCount,
                    percentage
                });
            });
        });

        const prepareDatasets = () => {
            return Object.keys(countries).map(countryCode => {
                const color = colors[countryCode];
                return {
                    label: countryNames[countryCode] || countryCode,
                    data: countries[countryCode].map(entry => ({
                        x: new Date(entry.timestamp),
                        y: usePercentage ? entry.percentage : entry.totalCount
                    })),
                    fill: false,
                    borderColor: color,
                    backgroundColor: color
                };
            });
        };

        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: prepareDatasets()
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'day'
                        },
                        title: {
                            display: true,
                            text: 'Date'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Total Count'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom',
                        labels: {
                            boxWidth: 10,
                            font: {
                                size: 10
                            },
                            usePointStyle: true,
                            borderWidth: 0
                        }
                    },
                    zoom: {
                        pan: {
                            enabled: true,
                            mode: 'x'
                        },
                        zoom: {
                            wheel: {
                                enabled: true
                            },
                            drag: {
                                enabled: true
                            },
                            mode: 'x'
                        }
                    },
                    tooltip: {
                        callbacks: {
                            title: function (tooltipItems) {
                                const date = new Date(tooltipItems[0].parsed.x);
                                return date.toLocaleDateString();
                            }
                        }
                    }
                }
            }
        });

        document.getElementById('showAll').addEventListener('click', () => {
            chart.resetZoom();
        });

        document.getElementById('showLast30Days').addEventListener('click', () => {
            const now = new Date();
            const last30Days = new Date();
            last30Days.setDate(now.getDate() - 30);
            chart.zoomScale('x', {
                min: last30Days.getTime(),
                max: now.getTime()
            });
        });

        document.getElementById('selectAll').addEventListener('click', () => {
            chart.data.datasets.forEach(dataset => {
                dataset.hidden = false;
            });
            chart.update();
        });

        document.getElementById('deselectAll').addEventListener('click', () => {
            chart.data.datasets.forEach(dataset => {
                dataset.hidden = true;
            });
            chart.update();
        });

        document.getElementById('switchYAxis').addEventListener('click', () => {
            usePercentage = !usePercentage;
            chart.data.datasets = prepareDatasets();
            chart.options.scales.y.title.text = usePercentage ? 'Percentage' : 'Total Count';
            chart.update();
        });

        const calculateIncreases = () => {
            const today = new Date(data[data.length - 1].timestamp);
            const yesterday = new Date(today);
            yesterday.setDate(today.getDate() - 1);
            const dayBeforeYesterday = new Date(yesterday);
            dayBeforeYesterday.setDate(yesterday.getDate() - 1);
            const lastWeek = new Date(today);
            lastWeek.setDate(today.getDate() - 7);
            const weekBeforeLast = new Date(lastWeek);
            weekBeforeLast.setDate(lastWeek.getDate() - 7);

            const increases = Object.keys(countries).map(countryCode => {
                const countryData = countries[countryCode];
                const todayData = countryData.find(entry => new Date(entry.timestamp).toDateString() === today.toDateString());
                const yesterdayData = countryData.find(entry => new Date(entry.timestamp).toDateString() === yesterday.toDateString());
                const dayBeforeYesterdayData = countryData.find(entry => new Date(entry.timestamp).toDateString() === dayBeforeYesterday.toDateString());
                const lastWeekData = countryData.find(entry => new Date(entry.timestamp).toDateString() === lastWeek.toDateString());
                const weekBeforeLastData = countryData.find(entry => new Date(entry.timestamp).toDateString() === weekBeforeLast.toDateString());

                const increaseFromYesterday = todayData && yesterdayData ? todayData.totalCount - yesterdayData.totalCount : 0;
                const increaseFromLastWeek = todayData && lastWeekData ? todayData.totalCount - lastWeekData.totalCount : 0;
                const percentageIncreaseFromYesterday = todayData && yesterdayData ? todayData.percentage - yesterdayData.percentage : 0;
                const percentageIncreaseFromLastWeek = todayData && lastWeekData ? todayData.percentage - lastWeekData.percentage : 0;

                const previousDayIncrease = yesterdayData && dayBeforeYesterdayData ? yesterdayData.totalCount - dayBeforeYesterdayData.totalCount : 0;
                const previousWeekIncrease = lastWeekData && weekBeforeLastData ? lastWeekData.totalCount - weekBeforeLastData.totalCount : 0;

                const rateChangeFromYesterday = previousDayIncrease ? ((increaseFromYesterday - previousDayIncrease) / previousDayIncrease) * 100 : 0;
                const rateChangeFromLastWeek = previousWeekIncrease ? ((increaseFromLastWeek - previousWeekIncrease) / previousWeekIncrease) * 100 : 0;

                return {
                    countryCode,
                    countryName: countryNames[countryCode] || countryCode,
                    increaseFromYesterday,
                    increaseFromLastWeek,
                    percentageIncreaseFromYesterday,
                    percentageIncreaseFromLastWeek,
                    rateChangeFromYesterday,
                    rateChangeFromLastWeek
                };
            });

            increases.sort((a, b) => b.increaseFromYesterday - a.increaseFromYesterday);

            const totalIncreaseFromYesterday = increases.reduce((sum, increase) => sum + increase.increaseFromYesterday, 0);
            const totalIncreaseFromLastWeek = increases.reduce((sum, increase) => sum + increase.increaseFromLastWeek, 0);

            const totalPreviousDayIncrease = increases.reduce((sum, increase) => {
                const countryData = countries[increase.countryCode];
                const yesterdayData = countryData.find(entry => new Date(entry.timestamp).toDateString() === yesterday.toDateString());
                const dayBeforeYesterdayData = countryData.find(entry => new Date(entry.timestamp).toDateString() === dayBeforeYesterday.toDateString());
                return sum + (yesterdayData && dayBeforeYesterdayData ? yesterdayData.totalCount - dayBeforeYesterdayData.totalCount : 0);
            }, 0);

            const totalPreviousWeekIncrease = increases.reduce((sum, increase) => {
                const countryData = countries[increase.countryCode];
                const lastWeekData = countryData.find(entry => new Date(entry.timestamp).toDateString() === lastWeek.toDateString());
                const weekBeforeLastData = countryData.find(entry => new Date(entry.timestamp).toDateString() === weekBeforeLast.toDateString());
                return sum + (lastWeekData && weekBeforeLastData ? lastWeekData.totalCount - weekBeforeLastData.totalCount : 0);
            }, 0);

            const totalRateChangeFromYesterday = totalPreviousDayIncrease ? ((totalIncreaseFromYesterday - totalPreviousDayIncrease) / totalPreviousDayIncrease) * 100 : 0;
            const totalRateChangeFromLastWeek = totalPreviousWeekIncrease ? ((totalIncreaseFromLastWeek - totalPreviousWeekIncrease) / totalPreviousWeekIncrease) * 100 : 0;

            const countryList = document.getElementById('countryList');
            countryList.innerHTML = `
                <div class="overall-count">
                    <p>Total Increase from Yesterday: +${totalIncreaseFromYesterday.toLocaleString()} (<span class="${totalRateChangeFromYesterday >= 0 ? 'increase' : 'decrease'}">${totalRateChangeFromYesterday.toFixed(2)}%</span>)</p>
                    <p>Total Increase from Last Week: +${totalIncreaseFromLastWeek.toLocaleString()} (<span class="${totalRateChangeFromLastWeek >= 0 ? 'increase' : 'decrease'}">${totalRateChangeFromLastWeek.toFixed(2)}%</span>)</p>
                </div>
                <div class="country-list-header">
                    <span class="country-name desktopTitle">Country</span>
                    <span class="increase desktopTitle">Increase from Yesterday</span>
                    <span class="rate-change desktopTitle">Rate Change from Yesterday</span>
                    <span class="increase desktopTitle">Increase from Last Week</span>
                    <span class="rate-change desktopTitle">Rate Change from Last Week</span>
                </div>
                <ul>` + increases.map(increase => `
                <li>
                    <span class="country-name">${countryFlags[increase.countryCode] || ''} ${increase.countryName}</span>
                    <span class="increase mobileTitle">Increase from Yesterday</span>
                    <span class="increase">+${increase.increaseFromYesterday.toLocaleString()} (${increase.percentageIncreaseFromYesterday.toFixed(2).toLocaleString()}%)</span>
                    <span class="rate-change mobileTitle">Rate Change from Yesterday</span>
                    <span class="${increase.rateChangeFromYesterday >= 0 ? 'faster' : 'slower'}">${increase.rateChangeFromYesterday.toFixed(2).toLocaleString()}%</span>
                    <span class="increase mobileTitle">Increase from Last Week</span>
                    <span class="increase">+${increase.increaseFromLastWeek.toLocaleString()} (${increase.percentageIncreaseFromLastWeek.toFixed(2).toLocaleString()}%)</span>
                    <span class="rate-change mobileTitle">Rate Change from Last Week</span>
                    <span class="${increase.rateChangeFromLastWeek >= 0 ? 'faster' : 'slower'}">${increase.rateChangeFromLastWeek.toFixed(2).toLocaleString()}%</span>
                </li>
            `).join('') + '</ul>';
        };

        calculateIncreases();

    } catch (error) {
        console.error('Error fetching or processing data:', error);
    }
});

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}