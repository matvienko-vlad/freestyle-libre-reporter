(
/**
 * Date to timestamp
 * @param  string template
 * @param  string date
 * @return string
 * @example         datetotime("d-m-Y", "26-02-2012") return 1330207200000
 */

function($, undefined) {
    var renderedCharts = {};

    function isChartsTabActive() {
        return $('#charts-tab-li').hasClass('active');
    }

    function renderDayCharts() {
        var datetimeRange = getDatetimeRange();

        for (var i=0; i<CHART_DATES.length; i++) {
            var date = CHART_DATES[i], date_value = parseDate(CHART_DATES[i]);

            var date_min = date_value.getTime();
            var date_max = date_min + 24 * 60 * 60 * 1000;

            if (date in renderedCharts) {
                continue
            }

            if (date_value >= datetimeRange.from && date_value <= datetimeRange.to) {
                renderChart(date, date_min, date_max, CHART_SERIES[date], CHART_MANUAL_SERIES[date], CHART_NOTES_SERIES[date], CHART_NOTES_SMALL_SERIES[date], CHART_INSULIN_F_SERIES[date], CHART_INSULIN_N_SERIES[date],);
                renderedCharts[date] = true;
            }
        }
    }

    function parseDate(input, format) {
        format = format || 'dd_mm_yyyy'; // somedefault format
        var parts = input.match(/(\d+)/g),
          i = 0, fmt = {};
        // extract date-part indexes from the format
        format.replace(/(yyyy|dd|mm)/g, function(part) { fmt[part] = i++; });
        //return new Date(parts[fmt['yyyy']], parts[fmt['mm']]-1,   parts[fmt['dd']], 2, 0, 0);
        return new Date(Date.UTC(parts[fmt['yyyy']], parts[fmt['mm']]-1, parts[fmt['dd']]));
    }

    function renderChart(id, date_min, date_max, series, manualSeries, notesSeries, notesSmallSeries, insulinFSeries, insulinNSeries) {

/**
 * Custom selection handler that selects points and cancels the default zoom behaviour
 */
function selectPointsByDrag(event) {

                var text,
                    l_x, l_y,
                    label;
                if (event.xAxis) {
                    // text = 'min: ' + Highcharts.numberFormat(event.xAxis[0].max - event.xAxis[0].min, 2) //+ ', max: ' + Highcharts.numberFormat(event.xAxis[0].max, 2);
                    
                    
//                var label = this.renderer.label(
//                        'x: ' + Highcharts.numberFormat(event.xAxis[0].value, 2) + ', y: ' + //Highcharts.numberFormat(event.yAxis[0].value, 2),
//                        event.xAxis[0].axis.toPixels(event.xAxis[0].value),
//                        event.yAxis[0].axis.toPixels(event.yAxis[0].value)
//                    )                    
                    
                    
                } else {
                    text = 'Selection reset';
                }
                
                text = 'int: ' + Highcharts.dateFormat('%H:%M', event.xAxis[0].max -
                    event.xAxis[0].min) + '<br>dif: '+Highcharts.numberFormat(event.yAxis[0].max-          
                        event.yAxis[0].min, 2);
                
                l_x = event.xAxis[0].axis.toPixels(event.xAxis[0].min);
                l_y = event.yAxis[0].axis.toPixels(event.yAxis[0].min);
                label = this.renderer.label(text, l_x, l_y)
                    .attr({
                        fill: Highcharts.getOptions().colors[0],
                        padding: 10,
                        r: 5,
                        zIndex: 8
                    })
                    .css({
                        color: '#FFFFFF'
                    })
                    .add();

                setTimeout(function () {
          //          label.fadeOut();
                }, 1000);


    return false; // Don't zoom

}


/**
 * The handler for a custom event, fired from selection event
 */
function selectedPoints(e) {
}


/**
 * On click, unselect all points
 */
function unselectByClick() {
}





        Highcharts.stockChart('chart_' + id, {
            chart: {
                type: 'spline',
                borderWidth: 1,
                zoomType: 'xy',
 		animation: false,
                events: {
                    selection: selectPointsByDrag,
                    selectedpoints: selectedPoints,
                    click: unselectByClick
                }
            },

	    navigator: {
                enabled: false
            },

            scrollbar: {
               enabled: false
            },

            rangeSelector: {
              enabled: false
            },


            loading: {
                hideDuration: 0,
                showDuration: 0
            },

            title: {
                text: normalizeDate(id)
            },
            subtitle: {
		text: ''
     	    },

            xAxis: [{
                type: 'datetime',
                min: date_min, 
                max: date_max, 

                tickInterval: 1 * 60 * 60 * 1000,
                gridLineWidth: 2,
                ordinal: false,
                title: {
		    text: ''
		}
            },
            {
                linkedTo: 0,
                labels: {
                    enabled: false
                },
                tickWidth: 0,
	    	    type: 'datetime',
		    tickInterval: 1 * 30 * 60 * 1000,
                    opposite: true,
                    gridLineWidth: 1,
             	    title: {
			text: ''
		    }
            }
	    ],

            yAxis: {
                title: '',
                min: 2,
                max: 10,
                tickInterval: 1,
                opposite: false,
                gridLineWidth: 2,
                plotBands: [{
                    //color: '#dff0d8',
                    //color: '#eef7ea',
                    color: '#efffff',
                    from: CHART_RANGE_MIN,
                    to: CHART_RANGE_MAX
                }]
            },

            legend: {
                enabled: true,
                lineHeight: 14
            },

	tooltip: {
		//headerFormat: '{point.x:%H:%M}<br>',
                //crosshairs: true,
		//pointFormat: 'СК {point.y:.1f}',
		borderRadius: 10,
                valueDecimals: 1,
		shared: true
	},

            series: [
                {
		    id: 'main_series',
                    name: 'СК',
                    data: series,
                    lineWidth: 2.5,
                    marker: {
                        enabled: true,
                        radius: 4,
                        //fillColor: '#0000FF'
			fillColor: '#000000'
                    },
                    states: {
                        hover: {
                            enabled: true,
                            lineWidth: 1
                        }
                    }
                },

   		{
	            type: 'flags',
        	    name: 'Примечания',
	            data: notesSeries,
                    y: 300,
                    xAxis: 1
        	    //onSeries: 'main_series'
	            //shape: 'squarepin'
        	    //shape: 'circlepin',
		    //color: Highcharts.getOptions().colors[0], // same as onSeries
	            //fillColor: Highcharts.getOptions().colors[0]
		},  

   		{
	            type: 'flags',
        	    name: 'ДопПримечания',
                    data: notesSmallSeries,
                    //y: -10,
                    xAxis: 0,
                    //onSeries: 'main_series',
        	    shape: 'circlepin'

		},  


   		{
	            type: 'flags',
        	    name: 'Быстрый инсулин',
	            data: insulinFSeries,
        	    onSeries: 'main_series',
        	    shape: 'circlepin',
	            fillColor: Highcharts.getOptions().colors[0]
		},  

   		{
	            type: 'flags',
        	    name: 'Ночной инсулин',
	            data: insulinNSeries,
        	    onSeries: 'main_series',
        	    shape: 'circlepin'
		},  

                {
                    name: 'Ручное измерение СК',
                    data: manualSeries,
                    lineWidth: 0,
                    enableMouseTracking: false,
                    marker : {
                        enabled: true,
                        radius: 3.5,
                        fillColor: '#FF0000',
                        symbol: 'circle'
                    },
		    dataLabels: {
			enabled: true,
                        format: '{point.y:.1f}'
		    },
                    states: {
                        hover: {
                            enabled: false
                        }
                    }
                }
            ],

            plotOptions: {
		line: {
			dataLabels: {
				enabled: true
			},
			enableMouseTracking: false
		},
		area: {
			animation: false
		},
    	        series: {
			animation: false,
                        color: '#000000'
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


        Highcharts.stockChart('chart-main', {
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
        var dateFrom = parseDate($('#id-date-from-select').val()),
            dateTo = parseDate($('#id-date-to-select').val());

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
            var date = CHART_DATES[i], date_value = parseDate(CHART_DATES[i]),
                table = $('#table_' + date),
                chart = $('#chart_' + date);

            if (date_value >= datetimeRange.from && date_value <= datetimeRange.to) {
                //console.log('showing', date);
                table.show();
                chart.show();
                renderDayCharts();
            } else {
                //console.log('hidding', date);
                table.hide();
                chart.hide();
            }
        }
    }

    $(document).ready(function(){
        renderDayCharts();
        $('#id-date-from-select').change(onDateChange);
        $('#id-date-to-select').change(onDateChange);

        $('#id-date-from-select').change();
    });

})(jQuery);
