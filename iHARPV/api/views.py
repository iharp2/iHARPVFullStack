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
    serializer = QuerySeriazlier(data=request.data)
    if not serializer.is_valid():
        error = str(serializer.errors)
        return JsonResponse({"error": error}, status=400)

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
    _request_id_ = serializer.data['id']

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
        file_name = f"download_{_request_id_}.nc"
        file_path = f"FrontEnd/build/static/for_download/{file_name}"
        _raster.to_netcdf(file_path)
        return JsonResponse(
            {
                "fileName": file_name,
            },
            status=201,
        )
    except ValueError as e:
        if str(e) == "iHARPV: Query range or resolution not supported":
            return JsonResponse(
                {"error": "iHARPV: Query range or resolution not supported"},
                status=400,
            )


@api_view(["POST"])
def getAreas(request):
    print("Request for Areas")
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
        _agg_method = request.data.get("secondAgg")
        _predicate = request.data.get("comparison")
        _value = float(request.data.get("value"))

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

            response = iHARPExecuterInstance.findArea(
                raster=_raster,
                agg_method=_agg_method,
                predicate=_predicate,
                value=_value,
            )
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
def getTimes(request):
    print("Request for Times")
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
        _agg_method = request.data.get("secondAgg")
        _predicate = request.data.get("comparison")
        _value = float(request.data.get("value"))

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

            response = iHARPExecuterInstance.findTime(
                raster=_raster,
                agg_method=_agg_method,
                predicate=_predicate,
                value=_value,
            )
            return JsonResponse(response, status=201)
        except ValueError as e:
            if str(e) == "iHARPV: Query range or resolution not supported":
                return JsonResponse(
                    {"error": "iHARPV: Query range or resolution not supported"},
                    status=400,
                )
    error = str(serializer.errors)
    return JsonResponse({"error": error}, status=400)
