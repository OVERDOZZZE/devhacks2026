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
    SubmitAnswerSerializer,
)
from src.agent.service import (
    generate_and_save_questions,
    score_and_save_answer,
    compute_and_save_overall,
)

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
            # Roll back status so the user can retry
            interview.status = Interview.Status.PENDING
            interview.save()
            logger.exception("Question generation failed for Interview #%d.", interview.pk)
            return Response(
                {'detail': f'Failed to generate questions: {exc}'},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        return Response(InterviewDetailSerializer(interview).data)


class SubmitAnswerView(APIView):

    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, interview_pk, qa_pk):
        interview = get_object_or_404(Interview, pk=interview_pk, user=request.user)

        if interview.status != Interview.Status.IN_PROGRESS:
            return Response(
                {'detail': 'Interview is not in progress.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        qa = get_object_or_404(InterviewQA, pk=qa_pk, interview=interview)

        serializer = SubmitAnswerSerializer(qa, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        try:
            # Re-fetch so qa.answer is the freshly saved value
            qa.refresh_from_db()
            score_and_save_answer(qa)
        except (RuntimeError, ValueError) as exc:
            logger.exception("Answer scoring failed for QA #%d.", qa.pk)
            # Return the saved answer without scores rather than a hard error
            return Response(
                {
                    **serializer.data,
                    'warning': f'Answer saved but scoring failed: {exc}',
                },
                status=status.HTTP_200_OK,
            )

        qa.refresh_from_db()
        return Response(SubmitAnswerSerializer(qa).data)


class InterviewCompleteView(APIView):
    """
    POST /interviews/<pk>/complete/

    Transitions the interview to COMPLETED, then asks the LLM to produce
    an overall score and feedback summary.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        interview = get_object_or_404(Interview, pk=pk, user=request.user)

        if interview.status != Interview.Status.IN_PROGRESS:
            return Response(
                {'detail': 'Interview is not in progress.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        interview.status = Interview.Status.COMPLETED
        interview.completed_at = timezone.now()
        interview.save()

        try:
            compute_and_save_overall(interview)
        except (RuntimeError, ValueError) as exc:
            logger.exception("Overall evaluation failed for Interview #%d.", interview.pk)
            # Interview is still marked completed; just warn about missing summary
            interview.refresh_from_db()
            return Response(
                {
                    **InterviewDetailSerializer(interview).data,
                    'warning': f'Interview completed but overall evaluation failed: {exc}',
                },
                status=status.HTTP_200_OK,
            )

        interview.refresh_from_db()
        return Response(InterviewDetailSerializer(interview).data)
