(
/**
 * Date to timestamp
 * @param  string template
 * @param  string date
 * @return string
 * @example         datetotime("d-m-Y", "26-02-2012") return 1330207200000
 */

 //TODO расчет среднего значения глюкозы за сутки
 //TODO расчет A1c по методу DCCT
 //TODO расчет A1c по методу IFCC
 //TODO возможность добавлять стрелки на график с расчетом диапазона времени и изменения глюкозы
 //TODO показывать сон на графике
 //TODO рассчет суммарной дозы инсулина
 //TODO рассчет % времени в зоне, выше зоны и ниже зоны
 //TODO отображение на графике минимума и максимума


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
// -------------------------------------------------------------------------------------------------------------------
 var
    MMOLL_TO_MGDL = 18.0182;

function getyValue(chartObj,seriesIndex,xValue){
    var yValue=null;
    var points=chartObj.series[seriesIndex].points;
    for(var i=0;i<points.length;i++){
        if(points[i].x>xValue)
        {
            break;
        }
        else{
            if(points[i].x==xValue)
            {
                yValue=points[i].y;
                break;
            }
        }
        yValue=points[i].y;
    }
    return yValue;
}

function getA1cDCCT(avg) {
    var A1cDCCT = 0;
    if (avg > 0) {
         A1cDCCT = (avg*MMOLL_TO_MGDL + 46.7) / 28.7;
    }
    return A1cDCCT;
}

function getA1cIFCC(avg) {
    var A1cIFCC = 0;
    if (avg > 0) {
       A1cIFCC =  ((avg*MMOLL_TO_MGDL + 46.7) / 28.7 - 2.15) * 10.929;
    }
    return A1cIFCC;
}

function getAvgGlu(chart, from=0, to=0)
{
    var i, len, sum_x, sum_y, x;
    var series = chart.series[0];
    var avg = 0;
    sum_x = 0;
    sum_y = 0;
    len = series.data.length;
    if (len > 2) {
        if (from == 0) {
            for (i = 1; i < len; ++i) {

                sum_y = sum_y
                    + (series.points[i].x-series.points[i-1].x)*(series.points[i].y+series.points[i-1].y)/2;
                sum_x = sum_x + series.points[i].x-series.points[i-1].x;
            }
        } else  {
            for (i = 1; i < len; ++i) {
                x = series.points[i].x;
                if ((x>from) && (x<to)) {
                    sum_y = sum_y
                        + (series.points[i].x-series.points[i-1].x)*(series.points[i].y+series.points[i-1].y)/2;
                    sum_x = sum_x + series.points[i].x-series.points[i-1].x;
                }
            }
        }
        if (sum_x > 0) {
            avg = sum_y/sum_x;
        }
    }
    return avg;
}

function showStatOnSelectReg(chart, from, to) {
     var series = chart.series[0];
     var text,
         l_x, l_y,
         label,
         shape;



     avg =  getAvgGlu(chart, from, to);
     text = '?'
     if (avg > 0) {
         text = 'Avg: ' + Highcharts.numberFormat(avg, 2) + ' mmol/L</br>'
             + 'A1cDCCT: ' + Highcharts.numberFormat(getA1cDCCT(avg), 2) + '%' + '</br>'
             + 'A1cIFCC: ' +  Highcharts.numberFormat(getA1cIFCC(avg), 2) + 'mmol/mol' + '</br>';

     }
     l_x = 250;
     l_y = 80;
     label = chart.renderer.label(text, l_x, l_y, 'rect', 1, 1, 1, 1)
                    .attr({
                        fill: Highcharts.getOptions().colors[0],
                        padding: 10,
                        r: 5,
                        zIndex: 8,
                        allowDragX: true,
                        allowDragY: true,


                    })
                    .css({
                        color: '#FFFFFF'
                    })
                    .add();

      setTimeout(function () {
          label.fadeOut(); }, 3000);
}

/**
 * Custom selection handler that selects points and cancels the default zoom behaviour
 */
function selectByDrag(event) {

    var text,
        l_x, l_y,
        label,
        shape;

    if (event.xAxis) {
        showStatOnSelectReg(this, event.xAxis[0].min, event.xAxis[0].max);
    }
    return false; // Don't zoom
}

function showStatOnLoad(chart) {
     var series = chart.series[0];
     var text,
         l_x, l_y,
         label,
         shape;

     avg =  getAvgGlu(chart);
     text = '?'
     if (avg > 0) {
         text = 'Avg: ' + Highcharts.numberFormat(avg, 2) + ' mmol/L</br>'
             + 'A1cDCCT: ' + Highcharts.numberFormat(getA1cDCCT(avg), 2) + '%' + '</br>'
             + 'A1cIFCC: ' +  Highcharts.numberFormat(getA1cIFCC(avg), 2) + 'mmol/mol' + '</br>';

     }
     l_x = 60;
     l_y = 80;
     label = chart.renderer.label(text, l_x, l_y, 'rect', 1, 1, 1, 1)
                    .attr({
                        fill: Highcharts.getOptions().colors[0],
                        padding: 10,
                        r: 5,
                        zIndex: 8,
                        allowDragX: true,
                        allowDragY: true,


                    })
                    .css({
                        color: '#FFFFFF'
                    })
                    .add();
}

function onLoad(event) {
    showStatOnLoad(this);
}

        Highcharts.stockChart('chart_' + id, {
            chart: {
                type: 'spline',
                borderWidth: 1,
                zoomType: 'x',
 		        animation: false,
                events: {
                   selection: selectByDrag,
                   load: onLoad
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
