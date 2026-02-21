from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
import logging

from .models import Agent, Interview, InterviewQA
from .serializers import (
    AgentSerializer,
    InterviewListSerializer,
    InterviewDetailSerializer,
    CompleteInterviewSerializer,
)
from src.agent.service import generate_and_save_questions, evaluate_and_save_all

logger = logging.getLogger(__name__)


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
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        interview = get_object_or_404(Interview, pk=pk, user=request.user)

        if interview.status != Interview.Status.PENDING:
            return Response(
                {'detail': 'Interview has already been started or completed.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        interview.status = Interview.Status.IN_PROGRESS
        interview.save()

        try:
            generate_and_save_questions(interview)
        except (RuntimeError, ValueError) as exc:
            interview.status = Interview.Status.PENDING
            interview.save()
            logger.exception("Question generation failed for Interview #%d.", interview.pk)
            return Response(
                {'detail': f'Failed to generate questions: {exc}'},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        interview.refresh_from_db()
        return Response(InterviewDetailSerializer(interview).data)


class InterviewCompleteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        interview = get_object_or_404(Interview, pk=pk, user=request.user)

        if interview.status != Interview.Status.IN_PROGRESS:
            return Response(
                {'detail': 'Interview is not in progress.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = CompleteInterviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        answers = serializer.validated_data['answers']

        interview.status = Interview.Status.COMPLETED
        interview.completed_at = timezone.now()
        interview.save()

        try:
            evaluate_and_save_all(interview, answers)
        except (RuntimeError, ValueError) as exc:
            logger.exception("Evaluation failed for Interview #%d.", interview.pk)
            interview.refresh_from_db()
            return Response(
                {
                    **InterviewDetailSerializer(interview).data,
                    'warning': f'Interview completed but evaluation failed: {exc}',
                },
                status=status.HTTP_200_OK,
            )

        interview.refresh_from_db()
        return Response(InterviewDetailSerializer(interview).data)
    