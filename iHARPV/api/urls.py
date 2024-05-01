from django.contrib import admin
from django.urls import path,include
from . import views
from .views import *

urlpatterns = [
    path('', views.index),
    path('db/', views.QueryList.as_view(),name="queries"),
    path('timeseries/', getTimeSeries,name="timeseries"),
    path('heatmap/', getHeatMap,name="heatmap"),
    path('download/', downloadData,name="download"),]