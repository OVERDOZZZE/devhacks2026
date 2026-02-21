from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from livekit.api import AccessToken, VideoGrants, LiveKitAPI
from livekit.api import CreateRoomRequest
from django.conf import settings
from src.interview.models import Interview
import json
import asyncio


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def livekit_token(request):
    interview_id = request.query_params.get("interview_id")

    try:
        interview = Interview.objects.prefetch_related("qa_pairs__question").get(
            pk=interview_id,
            user=request.user
        )
    except Interview.DoesNotExist:
        return Response({"detail": "Interview not found."}, status=404)

    questions = [
        {"qa_id": qa.pk, "question": qa.question.text}
        for qa in interview.qa_pairs.order_by("order")
    ]

    room_name = f"interview-{interview_id}"
    identity = f"user-{request.user.id}"

    async def create_room():
        async with LiveKitAPI(
            url=settings.LIVEKIT_URL,
            api_key=settings.LIVEKIT_API_KEY,
            api_secret=settings.LIVEKIT_API_SECRET,
        ) as lk:
            await lk.room.create_room(
                CreateRoomRequest(
                    name=room_name,
                    metadata=json.dumps(questions),
                    empty_timeout=300,  # close room after 5min if empty
                    max_participants=2,  # user + agent
                )
            )

    asyncio.run(create_room())

    token = (
        AccessToken(settings.LIVEKIT_API_KEY, settings.LIVEKIT_API_SECRET)
        .with_identity(identity)
        .with_name(request.user.email)
        .with_grants(VideoGrants(room_join=True, room=room_name))
        .to_jwt()
    )

    return Response({"token": token})
