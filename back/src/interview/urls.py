from django.urls import path
from . import views


urlpatterns = [
    # Agents
    path('agents/', views.AgentListView.as_view(), name='agent-list'),

    # Interviews
    path('interviews/', views.InterviewListCreateView.as_view(), name='interview-list-create'),
    path('interviews/<int:pk>/', views.InterviewDetailView.as_view(), name='interview-detail'),

    # Interview lifecycle
    path('interviews/<int:pk>/start/', views.InterviewStartView.as_view(), name='interview-start'),
    path('interviews/<int:pk>/complete/', views.InterviewCompleteView.as_view(), name='interview-complete'),

    # Answering questions
    path('interviews/<int:interview_pk>/qa/<int:qa_pk>/answer/', views.SubmitAnswerView.as_view(), name='submit-answer'),
]
