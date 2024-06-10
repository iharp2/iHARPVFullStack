from django.shortcuts import render
from rest_framework import generics
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from datetime import datetime
from .serializers import QuerySeriazlier
from .models import Query
from rest_framework.decorators import api_view
import os
from django.http import FileResponse, JsonResponse

import sys

sys.path.append("/data")
from iHARPScripts.iHARPExecutor import *


# Clear Model
# Query.objects.all().delete()

iHARPExecuterInstance = iHARPExecuter()


def index(request):
    return render(request, "index.html")


class QueryList(generics.ListAPIView):
    queryset = Query.objects.all()
    serializer_class = QuerySeriazlier
    permission_classes = [AllowAny]


@api_view(["POST"])
def getTimeSeries(request):
    print("Request for Time Seies ")
    serializer = QuerySeriazlier(data=request.data)
    if serializer.is_valid():
        serializer.save()
        _north = round(float(request.data.get("north")), 3)
        _south = round(float(request.data.get("south")), 3)
        _east = round(float(request.data.get("east")), 3)
        _west = round(float(request.data.get("west")), 3)
        _start_date_time = request.data.get("startDateTime")
        _end_date_time = request.data.get("endDateTime")
        _time_resolution = request.data.get("temporalLevel")
        _variable = request.data.get("variable")
        _time_agg_method = request.data.get("aggLevel")
        _spatial_resolution = float(request.data.get("spatialLevel"))

        try:
            _raster = iHARPExecuterInstance.getRaster(
                variable=_variable,
                start_datetime=_start_date_time,
                end_datetime=_end_date_time,
                time_resolution=_time_resolution,  # e.g., "hourly", "daily", "monthly", "yearly"
                time_agg_method=_time_agg_method,  # e.g., "mean", "max", "min"
                south=_south,
                north=_north,
                west=_west,
                east=_east,
                spatial_resolution=_spatial_resolution,  # e.g., 0.25, 0.5, 1.0, 2.5, 5.0
            )
            response = iHARPExecuterInstance.viewTimeSeries(raster=_raster)
            return JsonResponse(response, status=201)
        except ValueError as e:
            if str(e) == "iHARPV: Query range or resolution not supported":
                return JsonResponse(
                    {"error": "iHARPV: Query range or resolution not supported"},
                    status=400,
                )
    error = str(serializer.errors)
    return JsonResponse({"error": error}, status=400)


@api_view(["POST"])
def getHeatMap(request):
    print("Request for Heat Map")
    serializer = QuerySeriazlier(data=request.data)
    if serializer.is_valid():
        serializer.save()
        _north = round(float(request.data.get("north")), 3)
        _south = round(float(request.data.get("south")), 3)
        _east = round(float(request.data.get("east")), 3)
        _west = round(float(request.data.get("west")), 3)
        _start_date_time = request.data.get("startDateTime")
        _end_date_time = request.data.get("endDateTime")
        _time_resolution = request.data.get("temporalLevel")
        _variable = request.data.get("variable")
        _time_agg_method = request.data.get("aggLevel")
        _spatial_resolution = float(request.data.get("spatialLevel"))

        try:
            _raster = iHARPExecuterInstance.getRaster(
                variable=_variable,
                start_datetime=_start_date_time,
                end_datetime=_end_date_time,
                time_resolution=_time_resolution,  # e.g., "hourly", "daily", "monthly", "yearly"
                time_agg_method=_time_agg_method,  # e.g., "mean", "max", "min"
                south=_south,
                north=_north,
                west=_west,
                east=_east,
                spatial_resolution=_spatial_resolution,  # e.g., 0.25, 0.5, 1.0, 2.5, 5.0
            )
            videoFile = iHARPExecuterInstance.viewHeatMap(raster=_raster)
            return FileResponse(videoFile, content_type="video/mp4", status=201)
        except ValueError as e:
            if str(e) == "iHARPV: Query range or resolution not supported":
                return JsonResponse(
                    {"error": "iHARPV: Query range or resolution not supported"},
                    status=400,
                )
    error = str(serializer.errors)
    return JsonResponse({"error": error}, status=400)


@api_view(["POST"])
def downloadData(request):
    print("Request for Downloding Data")
    # print(request.data)
    serializer = QuerySeriazlier(data=request.data)
    if serializer.is_valid():
        serializer.save()
        now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        requestType = request.data.get("requestType")
        response = {
            "message": f"[Django {now}] Hi, Data Written Successfully: {requestType} !"
        }
        return Response(response, status=201)
    return Response(serializer.errors, status=400)


@api_view(["POST"])
def getAreas(request):
    print("Request for Areas")
    serializer = QuerySeriazlier(data=request.data)
    if serializer.is_valid():
        serializer.save()
        north = round(float(request.data.get("north")), 3)
        south = round(float(request.data.get("south")), 3)
        east = round(float(request.data.get("east")), 3)
        west = round(float(request.data.get("west")), 3)
        startDateTime = request.data.get("startDateTime")
        endDateTime = request.data.get("endDateTime")
        temporalLevel = request.data.get("temporalLevel")
        aggLevel = request.data.get("aggLevel")
        variable = request.data.get("variable")
        jsonData = iHARPExecuterInstance.getAreas(
            variable,
            startDateTime,
            endDateTime,
            temporalLevel,
            aggLevel,
            north,
            east,
            south,
            west,
        )
        return JsonResponse(jsonData, status=201, safe=False)
    return Response(serializer.errors, status=400)


@api_view(["POST"])
def getTimes(request):
    print("Request for Times")
    serializer = QuerySeriazlier(data=request.data)
    if serializer.is_valid():
        serializer.save()
        north = round(float(request.data.get("north")), 3)
        south = round(float(request.data.get("south")), 3)
        east = round(float(request.data.get("east")), 3)
        west = round(float(request.data.get("west")), 3)
        startDateTime = request.data.get("startDateTime")
        endDateTime = request.data.get("endDateTime")
        temporalLevel = request.data.get("temporalLevel")
        aggLevel = request.data.get("aggLevel")
        variable = request.data.get("variable")
        jsonData = iHARPExecuterInstance.getAreas(
            variable,
            startDateTime,
            endDateTime,
            temporalLevel,
            aggLevel,
            north,
            east,
            south,
            west,
        )
        return JsonResponse(jsonData, status=201, safe=False)
    return Response(serializer.errors, status=400)
