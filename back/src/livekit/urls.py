from django.urls import path
from .obtain_token import *


urlpatterns = [
    path("get_token/", livekit_token, name="livekit_token")
]
