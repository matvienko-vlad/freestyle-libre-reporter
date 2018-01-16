# -*- coding: utf-8 -*-

import os
import json
import jinja2
import bottle
import traceback
import sys
import time


import utils

app = bottle.Bottle()

JINJA_ENVIRONMENT = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.join(os.path.dirname(__file__),
                                   'templates')),
    extensions=['jinja2.ext.autoescape'],
    autoescape=False)

RANGE_MIN = 5.5
RANGE_MAX = 9.5
GPAPH_HEIGHT = 550

def get_template(name):
    return JINJA_ENVIRONMENT.get_template(name)


def get_range_cookie_value(cookie, default):
    value = bottle.request.get_cookie(cookie)
    try:
        return float(value)
    except:
        return default


def generate_error_reply(error, range_min, range_max):
    return get_template('new.html').render({
        'error': error,
        'range_min': range_min,
        'range_max': range_max,
    })


@app.route('/', method='GET')
def new_report():
    return get_template('new.html').render({
        'range_min': get_range_cookie_value('range_min', RANGE_MIN),
        'range_max': get_range_cookie_value('range_max', RANGE_MAX),
    })


@app.route('/last-measure', method='POST')
def get_last_measure():
    report = bottle.request.files.get('report')
    if report is None:
        return u'Не выбран файл'

    value, datetime = utils.get_last_measue(report.file)
    return '%s %s' % (value, datetime)


@app.route('/report', method='POST')
def generate_report():
    new_range_min = bottle.request.forms.get('range-min')
    try:
        new_range_min = float(new_range_min)
    except:
        new_range_min = RANGE_MIN
    else:
        bottle.response.set_cookie('range_min', str(new_range_min))

    new_range_max = bottle.request.forms.get('range-max')
    try:
        new_range_max = float(new_range_max)
    except:
        new_range_max = RANGE_MAX
    else:
        bottle.response.set_cookie('range_max', str(new_range_max))

    new_chart_height = GPAPH_HEIGHT

    report = bottle.request.files.get('report')
    if report is None:
        return generate_error_reply(u'Не выбран файл',
                                    new_range_min, new_range_max)

    try:
        points = utils.extract_points(report.file)
        history, series, manual_series, notes_series, notes_small_series, insulin_fast_series, insulin_night_series  = utils.generate_history_data(points)
        stats = utils.generate_in_zone_stats(history, new_range_min, new_range_max)
    except Exception as inst:
#        return generate_error_reply(u'Неверный формат файла', new_range_min, new_range_max)
        exc_type, exc_value, exc_traceback = sys.exc_info()
        return generate_error_reply("err: {0}; {1}".format(inst, traceback.format_tb(exc_traceback)), new_range_min, new_range_max)
    else:
        if not points:
            return generate_error_reply(u'Файл не содержит данных',
                                        new_range_min, new_range_max)

    dates_list = sorted(series.keys(), key=lambda (i): time.mktime(time.strptime(i, '%d_%m_%Y')), reverse = True)

    return get_template('report.html').render({
        'stats': stats,
        'series': json.dumps(series),
        'manual_series': json.dumps(manual_series),
        'notes_series': json.dumps(notes_series),
        'notes_small_series': json.dumps(notes_small_series),
	'insulin_fast_series' : json.dumps(insulin_fast_series),
	'insulin_night_series' : json.dumps(insulin_night_series),
        'history': history,
        'dates_list': dates_list,
        'dates': json.dumps(dates_list),
        'range_min': new_range_min,
        'range_max': new_range_max,
        'chart_height': new_chart_height
    })


@app.error(404)
def error_404(error):
    """Return a custom 404 error."""
    return 'Sorry, nothing at this URL.'
