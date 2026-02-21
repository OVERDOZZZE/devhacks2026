from django.urls import path
from . import views
from .cv_views import CVAnalysisView


urlpatterns = [
    path('agents/', views.AgentListView.as_view(), name='agent-list'),

    path('interviews/', views.InterviewListCreateView.as_view(), name='interview-list-create'),
    path('interviews/<int:pk>/', views.InterviewDetailView.as_view(), name='interview-detail'),

    path('interviews/<int:pk>/start/', views.InterviewStartView.as_view(), name='interview-start'),
    path('interviews/<int:pk>/complete/', views.InterviewCompleteView.as_view(), name='interview-complete'),

    path('cv/analyse/', CVAnalysisView.as_view(), name='cv-analyse'),
]
