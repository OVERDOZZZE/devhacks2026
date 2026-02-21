from rest_framework import serializers
from .models import Agent, Question, Interview, InterviewQA


class AgentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Agent
        fields = ['id', 'name', 'prompt']


class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ['id', 'text']


class InterviewQASerializer(serializers.ModelSerializer):
    question = QuestionSerializer(read_only=True)

    class Meta:
        model = InterviewQA
        fields = ['id', 'question', 'answer', 'score', 'feedback', 'order']
        read_only_fields = ['score', 'feedback', 'order', 'question']


class InterviewListSerializer(serializers.ModelSerializer):
    agent = AgentSerializer(read_only=True)

    class Meta:
        model = Interview
        fields = [
            'id', 'agent', 'job_description', 'number_of_questions',
            'status', 'overall_score', 'created_at', 'completed_at'
        ]
        read_only_fields = ['status', 'overall_score', 'created_at', 'completed_at']


class InterviewDetailSerializer(serializers.ModelSerializer):
    agent = AgentSerializer(read_only=True)
    agent_id = serializers.PrimaryKeyRelatedField(
        queryset=Agent.objects.all(), source='agent', write_only=True
    )
    qa_pairs = InterviewQASerializer(many=True, read_only=True)

    class Meta:
        model = Interview
        fields = [
            'id', 'agent', 'agent_id', 'job_description', 'number_of_questions',
            'status', 'overall_score', 'overall_feedback', 'qa_pairs',
            'created_at', 'completed_at'
        ]
        read_only_fields = [
            'status', 'overall_score', 'overall_feedback',
            'created_at', 'completed_at', 'qa_pairs'
        ]


class QASubmissionSerializer(serializers.Serializer):
    """Represents a single question-answer pair submitted by the frontend."""
    qa_id = serializers.IntegerField()
    answer = serializers.CharField(allow_blank=True)


class CompleteInterviewSerializer(serializers.Serializer):
    """Payload sent by the frontend when finishing an interview."""
    answers = QASubmissionSerializer(many=True)

    def validate_answers(self, value):
        if not value:
            raise serializers.ValidationError("At least one answer must be submitted.")
        return value
    