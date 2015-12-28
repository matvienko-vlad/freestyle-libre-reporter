# -*- coding: utf-8 -*-

import csv
import time
from collections import defaultdict

TIME_FORMAT = "%Y/%m/%d %H:%M"


def extract_points(fobj):
    reader = csv.reader(fobj, delimiter='\t')
    for line in reader:
        if len(line) == 1:
            continue
        if line[0] == 'ID':
            continue
        datetime = line[1]
        record_type = line[2]
        if record_type not in ('1', '0'):
            continue
        manual = record_type == '1'
        value = line[4] if manual else line[3]

        yield (datetime, float(value), manual)


def generate_history_data(points):
    days = defaultdict(list)
    series = defaultdict(list)
    manuals = defaultdict(list)

    for datetime, value, manual in points:
        date, _time = datetime.split(' ')
        ms = time.mktime(time.strptime(datetime, TIME_FORMAT)) * 1000

        normalized_date = date.replace('/', '_')
        days[normalized_date].append((_time, value, manual))
        series[normalized_date].append((ms, value))
        if manual:
            manuals[normalized_date].append((ms, value))

    data = []
    for date in sorted(days, reverse=True):
        data.append((date, sorted(days[date], reverse=True)))

    for date, points in series.iteritems():
        series[date] = sorted(points)

    for date, points in manuals.iteritems():
        manuals[date] = sorted(points)

    return data, series, manuals


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
