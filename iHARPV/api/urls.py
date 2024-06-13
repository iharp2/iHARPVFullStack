from django.contrib import admin
from django.urls import path, include
from . import views
from .views import *

# from .views import trigger_error

urlpatterns = [
    path("", views.index),
    path("db/", views.QueryList.as_view(), name="queries"),
    path("timeseries/", getTimeSeries, name="timeseries"),
    path("heatmap/", getHeatMap, name="heatmap"),
    path("download/", downloadData, name="download"),
    path("downloadareastimes/", downloadAreasTimes, name="downloadareastimes"),
    path("areas/", getAreas, name="areas"),
    path("times/", getTimes, name="times"),
]
