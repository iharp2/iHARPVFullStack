from django.contrib import admin
from django.urls import path, include
from django.urls import re_path
from django.views.generic import TemplateView

# from api.views import CreateUserView
urlpatterns = [path("admin/", admin.site.urls), path("", include("api.urls"))]
urlpatterns += [re_path(r"^.*", TemplateView.as_view(template_name="index.html"))]
