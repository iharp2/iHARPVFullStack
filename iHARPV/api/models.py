from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

# Create your models here.


class Query(models.Model):
    TEMPORAL_CHOICES = (
        ("hourly", "hourly"),
        ("daily", "daily"),
        ("monthly", "monthly"),
        ("yearly", "yearly"),
    )
    AGG_CHOICES = (
        ("min", "min"),
        ("max", "max"),
        ("mean", "mean"),
    )
    REQUEST_CHOICES = (
        ("Time Series", "Time Series"),
        ("Heat Map", "Heat Map"),
        ("Data Download", "Data Download"),
    )
    requestType = models.CharField(max_length=15, choices=REQUEST_CHOICES)
    startDateTime = models.DateTimeField(default=timezone.now)
    endDateTime = models.DateTimeField(default=timezone.now)
    temporalLevel = models.CharField(max_length=10, choices=TEMPORAL_CHOICES)
    aggLevel = models.CharField(max_length=10, choices=AGG_CHOICES)
    north = models.DecimalField(max_digits=40, decimal_places=35)
    east = models.DecimalField(max_digits=40, decimal_places=35)
    south = models.DecimalField(max_digits=40, decimal_places=35)
    west = models.DecimalField(max_digits=40, decimal_places=35)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
