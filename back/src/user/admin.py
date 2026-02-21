from django.contrib import admin
from .models import CustomUser, JobType, Company


admin.site.register(CustomUser)
admin.site.register(JobType)
admin.site.register(Company)

