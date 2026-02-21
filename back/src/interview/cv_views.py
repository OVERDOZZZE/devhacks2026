from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
import logging

from .cv_service import analyse_cv

logger = logging.getLogger(__name__)

ALLOWED_EXTENSIONS = {".pdf", ".txt", ".md"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB


class CVAnalysisView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        file = request.FILES.get("cv")
        if not file:
            return Response({"detail": "No file uploaded. Please attach a CV file."}, status=status.HTTP_400_BAD_REQUEST)

        filename = file.name or ""
        ext = "." + filename.rsplit(".", 1)[-1].lower() if "." in filename else ""

        if ext not in ALLOWED_EXTENSIONS:
            return Response(
                {"detail": f"Unsupported file type '{ext}'. Please upload a PDF or text file."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if file.size > MAX_FILE_SIZE:
            return Response(
                {"detail": "File too large. Maximum size is 5 MB."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        file_bytes = file.read()

        try:
            result = analyse_cv(file_bytes, filename)
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)
        except RuntimeError as exc:
            logger.exception("CV analysis LLM error.")
            return Response({"detail": f"Analysis failed: {exc}"}, status=status.HTTP_502_BAD_GATEWAY)
        except Exception:
            logger.exception("Unexpected error during CV analysis.")
            return Response({"detail": "An unexpected error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(result, status=status.HTTP_200_OK)
