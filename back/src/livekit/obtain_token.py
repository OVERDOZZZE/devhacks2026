from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from livekit.api import AccessToken, VideoGrants
from django.conf import settings


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def livekit_token(request):
    room_name = "test-room"
    identity = f"user-{request.user.id if request.user.is_authenticated else 'guest'}"

    token = (
        AccessToken(settings.LIVEKIT_API_KEY, settings.LIVEKIT_API_SECRET)
        .with_identity(identity)
        .with_grants(VideoGrants(room_join=True, room=room_name))
    )

    return Response({"token": token.to_jwt()})
