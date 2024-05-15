from django.shortcuts import render
from rest_framework import generics
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from datetime import datetime
from .serializers import QuerySeriazlier
from .models import Query
from rest_framework.decorators import api_view
from .scripts import *
import os
from django.http import FileResponse

#Clear Model
# Query.objects.all().delete()
# from django.shortcuts import render
iHARPExecuterInstance = iHARPExecuter()
def index(request):
    return render(request, 'index.html')
class QueryList(generics.ListAPIView):
    queryset = Query.objects.all()
    serializer_class = QuerySeriazlier
    permission_classes = [AllowAny]

@api_view(["POST"])
def getTimeSeries(request):
    print("Request for Time Seies ")
    # print(request.data)
    serializer = QuerySeriazlier(data=request.data)
    if serializer.is_valid():
        serializer.save()
        north = round(float(request.data.get("north")),3)
        south = round(float(request.data.get("south")),3)
        east = round(float(request.data.get("east")),3)
        west = round(float(request.data.get("west")),3)
        startDateTime = request.data.get("startDateTime")
        endDateTime = request.data.get("endDateTime")
        temporalLevel = request.data.get("temporalLevel")
        #"/home/husse408/iHARP/iHARPVWebsite/iHARP/iHARPBackend/data/day_1_temp_data.nc"
        response = iHARPExecuterInstance.getTimeSeriesScript(startDateTime,endDateTime,temporalLevel,north,east,south,west)
        return Response(response, status=201)
            # if response:
            #     response = {"message": f" Time Series Created Successfully!"}
            #     return Response(response, status=201)
            # else:
            #     return Response("Couldnt Retrieve TimeSeries For Some Reason", status=400)
    return Response(serializer.errors, status=400)
@api_view(["POST"])
def getHeatMap(request):
    print("Request for Heat Map")
    # print(request.data)
    serializer = QuerySeriazlier(data=request.data)
    if serializer.is_valid():
        serializer.save()
        north = round(float(request.data.get("north")),3)
        south = round(float(request.data.get("south")),3)
        east = round(float(request.data.get("east")),3)
        west = round(float(request.data.get("west")),3)
        startDateTime = request.data.get("startDateTime")
        endDateTime = request.data.get("endDateTime")
        temporalLevel = request.data.get("temporalLevel")
        aggLevel = request.data.get("aggLevel")
        videoFile = iHARPExecuterInstance.getHeatMapScript(startDateTime,endDateTime,temporalLevel,aggLevel,north,east,south,west)
        return FileResponse(videoFile, content_type='video/mp4',status=201)
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
        response = {"message": f"[Django {now}] Hi, Data Written Successfully: {requestType} !"}
        return Response(response, status=201)
    return Response(serializer.errors, status=400)
    