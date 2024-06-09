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
        north = round(float(request.data.get("north")), 3)
        south = round(float(request.data.get("south")), 3)
        east = round(float(request.data.get("east")), 3)
        west = round(float(request.data.get("west")), 3)
        startDateTime = request.data.get("startDateTime")
        print(startDateTime)
        endDateTime = request.data.get("endDateTime")
        print(endDateTime)
        temporalLevel = request.data.get("temporalLevel")
        variable = request.data.get("variable")
        aggLevel = request.data.get("aggLevel")
        response = iHARPExecuterInstance.getTimeSeries(
            variable=variable,
            start_datetime=startDateTime,
            end_datetime=endDateTime,
            time_resolution=temporalLevel,
            north=north,
            east=east,
            south=south,
            west=west,
            time_agg_method=aggLevel,
            spatial_resolution=0.25,
            spatial_agg_method="",
        )

        return JsonResponse(response, status=201)
    return Response(serializer.errors, status=400)


@api_view(["POST"])
def getHeatMap(request):
    print("Request for Heat Map")
    # print(request.data)
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
        videoFile = iHARPExecuterInstance.getHeatMapScript(
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
        return FileResponse(videoFile, content_type="video/mp4", status=201)
    return Response(serializer.errors, status=400)


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
def getArea(request):
    print("Request for Heat Map")
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
