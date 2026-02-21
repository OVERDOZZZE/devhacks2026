from django.contrib import admin
from .models import Interview, InterviewQA, Agent, Question


admin.site.register(Interview)
admin.site.register(InterviewQA)
admin.site.register(Agent)
admin.site.register(Question)
