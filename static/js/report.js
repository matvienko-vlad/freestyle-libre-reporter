(function($, undefined) {
    var mainChartRendered = false,
        renderedCharts = {};

    function isChartsTabActive() {
        return $('#charts-tab-li').hasClass('active');
    }

    function renderDayCharts() {
        var datetimeRange = getDatetimeRange();

        for (var i=0; i<CHART_DATES.length; i++) {
            var date = CHART_DATES[i];

            if (date in renderedCharts) {
                continue
            }

            if (date >= datetimeRange.from && date <= datetimeRange.to) {
                //console.log('rendering chart', date);
                renderChart(date, CHART_SERIES[date], CHART_MANUAL_SERIES[date]);
                renderedCharts[date] = true;
            }
        }
    }

    function renderChart(id, series, manualSeries) {
        $('#chart_' + id).highcharts({
            chart: {
                type: 'spline',
                borderWidth: 1,
                animation: false
            },

            loading: {
                hideDuration: 0,
                showDuration: 0
            },

            title: {
                text: normalizeDate(id)
            },

            xAxis: {
                type: 'datetime',
                tickInterval: 1 * 60 * 60 * 1000
            },

            yAxis: {
                title: '',
                min: 2,
                tickInterval: 1,
                plotBands: [{
                    color: '#dff0d8',
                    from: CHART_RANGE_MIN,
                    to: CHART_RANGE_MAX
                }]
            },

            legend: {
                enabled: true,
                lineHeight: 14
            },

            series: [
                {
                    name: 'СК',
                    data: series,
                    lineWidth: 1,
                    marker: {
                        enabled: true,
                        radius: 2,
                        fillColor: '#FF9999'
                    },
                    states: {
                        hover: {
                            enabled: true,
                            lineWidth: 1
                        }
                    }
                },
                {
                    name: 'Ручное измерение СК',
                    data: manualSeries,
                    lineWidth: 0,
                    enableMouseTracking: false,
                    marker : {
                        enabled: true,
                        radius: 2,
                        fillColor: '#FF0000',
                        symbol: 'circle'
                    },
                    states: {
                        hover: {
                            enabled: false
                        }
                    }
                }
            ],

            plotOptions: {
                area: {
                    animation: false
                },
                series: {
                    animation: false
                }
            }
        });
    }

    function renderMainChart() {
        //console.log('rendering main chart');

        var series = [];
        for (var i=0, chartsCount=CHART_DATES.length; i<chartsCount; i++) {
            series = series.concat(CHART_SERIES[CHART_DATES[i]]);
        }

        $('#chart-main').highcharts({
            chart: {
                zoomType: 'x',
                type: 'spline',
                borderWidth: 1,
                animation: false
            },

            loading: {
                hideDuration: 0,
                showDuration: 0
            },

            title: {
                text: 'Данные за весь период'
            },

            subtitle: {
                text: 'Нажмите и протяните по графику для увеличения'
            },

            xAxis: {
                type: 'datetime',
                tickInterval: 24 * 60 * 60 * 1000
            },

            yAxis: {
                title: '',
                min: 2,
                tickInterval: 1,
                plotBands: [{
                    color: '#dff0d8',
                    from: CHART_RANGE_MIN,
                    to: CHART_RANGE_MAX
                }]
            },

            legend: {
                enabled: false
            },

            series: [{
                name: 'Значение',
                data: series
            }],

            plotOptions: {
                area: {
                    animation: false
                },
                spline: {
                    animation: false
                },
                series: {
                    lineWidth: 1,
                    animation: false,
                    marker: {
                        enabled: false,
                        radius: 2,
                        fillColor: '#FF8888'
                    },
                    states: {
                        hover: {
                            enabled: true,
                            lineWidth: 1
                        }
                    }
                }
            }
        });
    }

    function normalizeDate(date) {
        return date.replace("_", "/").replace("_", "/");
    }

    function getDatetimeRange() {
        var dateFrom = $('#id-date-from-select').val(),
            dateTo = $('#id-date-to-select').val();

        if (dateFrom > dateTo) {
            var tmp = dateFrom;
            dateFrom = dateTo;
            dateTo = tmp;
        }

        return {from: dateFrom, to: dateTo};
    }

    function onDateChange(event) {
        var datetimeRange = getDatetimeRange();

        for (var i=0; i<CHART_DATES.length; i++) {
            var date = CHART_DATES[i],
                table = $('#table_' + date),
                chart = $('#chart_' + date);

            if (date >= datetimeRange.from && date <= datetimeRange.to) {
                //console.log('showing', date);
                table.show();
                chart.show();
                if (isChartsTabActive()) {
                    renderDayCharts();
                }
            } else {
                //console.log('hidding', date);
                table.hide();
                chart.hide();
            }
        }
    }

    function onChartsTabClick(event) {
        if (!mainChartRendered) {
            setTimeout(function() {
                renderMainChart();
                renderDayCharts();
            }, 100);
            mainChartRendered = true;
        } else {
            renderDayCharts();
        }

        return true;
    }


    $(document).ready(function(){
        $('#charts-tab').click(onChartsTabClick);
        $('#id-date-from-select').change(onDateChange);
        $('#id-date-to-select').change(onDateChange);

        $('#id-date-from-select').change();
    });

})(jQuery);
