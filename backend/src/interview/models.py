from django.db import models
from src.user.models import CustomUser


class Agent(models.Model):
    class Voice(models.TextChoices):
        ALLOY  = "alloy",  "Alloy (neutral)"
        ECHO   = "echo",   "Echo (male)"
        FABLE  = "fable",  "Fable (British male)"
        ONYX   = "onyx",   "Onyx (deep male)"
        NOVA   = "nova",   "Nova (female)"
        SHIMMER = "shimmer","Shimmer (warm female)"

    name   = models.CharField(max_length=255, unique=True)
    prompt = models.TextField(help_text="System prompt that defines the agent's personality and interview style.")
    voice  = models.CharField(
        max_length=20,
        choices=Voice.choices,
        default=Voice.ALLOY,
        help_text="OpenAI TTS voice used by the LiveKit agent.",
    )

    def __str__(self):
        return self.name


class Question(models.Model):
    text = models.TextField()

    def __str__(self):
        return self.text


class Interview(models.Model):
    class NumberOfQuestions(models.IntegerChoices):
        Q1  = 1
        Q3 = 3
        Q5  = 5
        Q10 = 10
        Q15 = 15

    class Status(models.TextChoices):
        PENDING     = "pending"
        IN_PROGRESS = "in_progress"
        COMPLETED   = "completed"

    user = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name="interviews",
    )
    agent = models.ForeignKey(
        Agent,
        on_delete=models.SET_NULL,
        null=True,
        related_name="interviews",
    )
    job_description     = models.TextField(blank=True, null=True)
    number_of_questions = models.PositiveSmallIntegerField(
        choices=NumberOfQuestions,
        default=NumberOfQuestions.Q5,
    )
    status           = models.CharField(max_length=20, choices=Status, default=Status.PENDING)
    overall_score    = models.PositiveSmallIntegerField(blank=True, null=True)
    overall_feedback = models.TextField(blank=True, null=True)

    created_at   = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"{self.user}, Interview #{self.pk}"


class InterviewQA(models.Model):
    interview = models.ForeignKey(Interview, on_delete=models.CASCADE, related_name="qa_pairs")
    question  = models.ForeignKey(Question, on_delete=models.CASCADE)
    answer    = models.TextField(blank=True, null=True)
    score     = models.PositiveSmallIntegerField(blank=True, null=True)
    feedback  = models.TextField(blank=True, null=True)
    order     = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return f"Q{self.order}: {self.question}"