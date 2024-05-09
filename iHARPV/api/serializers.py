from rest_framework import serializers
from .models import Query



class QuerySeriazlier(serializers.ModelSerializer):        
    class Meta:
        model = Query 
        # fields = "__all__"
        fields = ["id","startDateTime","endDateTime","temporalLevel","north","south","east","west","created_at"]