# -*- coding: utf-8 -*-

import csv
import time
import gzip
from collections import defaultdict
try:
    from io import BytesIO
except ImportError: # Python < 2.6
    from StringIO import StringIO as BytesIO

TIME_FORMAT = "%d/%m/%Y %H.%M.%S"

# type_data 
# record        = 1
# manual        = 2
# notes         = 3
# insulin_fast  = 4
# insulin_night = 5

def read_file(fobj):
    data = fobj.read()
    if data[0:2] == '\x1f\x8b':
        data = gzip.GzipFile(fileobj=BytesIO(data)).read()
    return BytesIO(data.decode('utf-16').encode('utf-8'))

def extract_points(fobj):
#    c = fobj.read().decode('utf-16').encode('utf-8')
#    reader = csv.reader(BytesIO(c), delimiter=';')
    reader = csv.reader(read_file(fobj), delimiter=';')
    i = 0;
    for line in reader:
        type_data = 0
        if len(line) == 1:
            continue
        if len(line) < 13:
            continue
        if i > 10000 :
            break
        i = i + 1
        if line[0] == 'ID':
            continue
        datetime = line[1]
        record_type = line[6]
        note = ''
        if record_type in ('0', '3', '5'):
            if len(line[5]) > 0 :
                type_data  =  1
                if record_type == '0': type_data  =  2

                value = line[5] 
                value = value.replace(',', '.')
                value = float(value)
                value = value/18.0
            elif record_type in ('0'):
                if (len(line[8])) > 0 :
                    type_data  =  4
                    value = line[8] 
                    if line[9].decode('utf8') == u'Ночной' :                 
                        type_data  =  5

                if (len(line[12])) > 0 :
                    type_data = 3
                    note = line[12]

            yield (datetime, value, type_data, note)


def get_last_measue(fobj):
    reader = csv.reader(fobj, delimiter='\t')
    for line in reader:
        pass

    try:
        datetime = line[1]
        record_type = line[2]
        manual = record_type == '1'
        value = line[4] if manual else line[3]
        return value, datetime.split(' ')[-1]
    except Exception:
        return None, None


def generate_history_data(points):
    days = defaultdict(list)
    series = defaultdict(list)
    manuals = defaultdict(list)
    notes = defaultdict(list)
    notes_small = defaultdict(list)
    insulin_fast = defaultdict(list)
    insulin_night = defaultdict(list)

    for datetime, value, type_data, note in points:
        date, _time = datetime.split(' ')
        ms = time.mktime(time.strptime(datetime, TIME_FORMAT)) * 1000

        normalized_date = date.replace('/', '_')
        days[normalized_date].append((_time, value, type_data, note))
        if type_data == 1:
            series[normalized_date].append((ms, value))
        if type_data == 2:
            manuals[normalized_date].append((ms, value))
        if type_data == 3:
#            if note[0].decode('utf8') == u'.' :                 
            if note[0] == u'.' :                 
                note = note[1:len(note)]
                notes[normalized_date].append({'x': ms, 'title': note.replace(' ', '<br>'), 'text': note})
            else :
                notes_small[normalized_date].append({'x': ms, 'title': 'N', 'text': note})

        if type_data == 4:
            insulin_fast[normalized_date].append({'x': ms, 'title': value, 'text': u'Быстрый инсулин'})
        if type_data == 5:
            insulin_night[normalized_date].append({'x': ms, 'title': value, 'text': u'Ночной инсулин'})



    data = []
    for date in sorted(days, reverse=True):
        data.append((date, sorted(days[date], reverse=True)))

    for date, points in series.iteritems():
        series[date] = sorted(points)

    for date, points in manuals.iteritems():
        manuals[date] = sorted(points)

    for date, points in notes.iteritems():
        notes[date] = sorted(points)

    for date, points in notes_small.iteritems():
        notes_small[date] = sorted(points)

    for date, points in insulin_fast.iteritems():
        insulin_fast[date] = sorted(points)

    for date, points in insulin_night.iteritems():
        insulin_night[date] = sorted(points)


    return data, series, manuals, notes, notes_small, insulin_fast, insulin_night


def generate_in_zone_stats(history, range_min, range_max):
    stats = {}
    for date, points in history:
        in_zone = 0.0
        for point in points:
            if range_min <= point[1] <= range_max:
                in_zone += 1
        stats[date] = int(in_zone / len(points) * 100)
    return stats                                                                             


if __name__ == "__main__":
    import sys
    fname = sys.argv[1]
    fobj = open(fname, 'r')
    points = extract_points(fobj)
    print 'points:', points
    history, series = generate_history_data(points)
    print 'history:', history
    print 'series:', series
