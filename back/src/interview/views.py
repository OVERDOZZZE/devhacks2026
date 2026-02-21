from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import Agent, Interview, InterviewQA
from .serializers import (
    AgentSerializer,
    InterviewListSerializer,
    InterviewDetailSerializer,
    SubmitAnswerSerializer,
)


class AgentListView(generics.ListAPIView):
    serializer_class = AgentSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Agent.objects.all()


class InterviewListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return InterviewDetailSerializer
        return InterviewListSerializer

    def get_queryset(self):
        return Interview.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class InterviewDetailView(generics.RetrieveAPIView):
    serializer_class = InterviewDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Interview.objects.filter(user=self.request.user)


class InterviewStartView(APIView):
    """
    Start an interview — transitions status from PENDING to IN_PROGRESS.
    This is where you'd trigger AI question generation.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        interview = get_object_or_404(Interview, pk=pk, user=request.user)

        if interview.status != Interview.Status.PENDING:
            return Response(
                {'detail': 'Interview has already been started or completed.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        interview.status = Interview.Status.IN_PROGRESS
        interview.save()

        # TODO: trigger AI agent to generate questions here
        # and populate InterviewQA rows

        return Response(InterviewDetailSerializer(interview).data)


class SubmitAnswerView(APIView):
    """Submit an answer for a specific QA pair."""
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, interview_pk, qa_pk):
        interview = get_object_or_404(Interview, pk=interview_pk, user=request.user)

        if interview.status != Interview.Status.IN_PROGRESS:
            return Response(
                {'detail': 'Interview is not in progress.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        qa = get_object_or_404(InterviewQA, pk=qa_pk, interview=interview)

        serializer = SubmitAnswerSerializer(qa, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        # TODO: trigger AI scoring for this answer here

        return Response(serializer.data)


class InterviewCompleteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        interview = get_object_or_404(Interview, pk=pk, user=request.user)

        if interview.status != Interview.Status.IN_PROGRESS:
            return Response(
                {'detail': 'Interview is not in progress.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        interview.status = Interview.Status.COMPLETED
        interview.completed_at = timezone.now()
        interview.save()

        # TODO: trigger AI to compute overall_score and overall_feedback here

        return Response(InterviewDetailSerializer(interview).data)
    
