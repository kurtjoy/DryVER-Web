from django.urls import path
from . import views


urlpatterns = [
    path('', views.index, name="index"),
    path('windy', views.Windy.as_view(), name="Windy"),
]