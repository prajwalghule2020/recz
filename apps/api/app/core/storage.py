import io
import boto3
from botocore.client import Config
from botocore.exceptions import ClientError

from app.core.config import settings


def _make_client(endpoint: str | None = None):
    ep = endpoint or settings.minio_endpoint
    return boto3.client(
        "s3",
        endpoint_url=f"http{'s' if settings.minio_secure else ''}://{ep}",
        aws_access_key_id=settings.minio_access_key,
        aws_secret_access_key=settings.minio_secret_key,
        config=Config(signature_version="s3v4"),
        region_name="us-east-1",
    )


# Internal client — used for uploads/downloads within Docker network
_client = _make_client()

# Public client — used ONLY for generating presigned URLs the browser can reach
_public_client = _make_client(settings.minio_public_endpoint)


def ensure_bucket() -> None:
    """Create the raw-image bucket if it doesn't exist."""
    try:
        _client.head_bucket(Bucket=settings.minio_bucket)
    except ClientError as e:
        if e.response["Error"]["Code"] in ("404", "NoSuchBucket"):
            _client.create_bucket(Bucket=settings.minio_bucket)
        else:
            raise


def upload_object(object_key: str, data: bytes, content_type: str = "application/octet-stream") -> None:
    _client.upload_fileobj(
        io.BytesIO(data),
        settings.minio_bucket,
        object_key,
        ExtraArgs={"ContentType": content_type},
    )


def read_object_bytes(object_key: str) -> bytes:
    buf = io.BytesIO()
    _client.download_fileobj(settings.minio_bucket, object_key, buf)
    buf.seek(0)
    return buf.read()


def get_presigned_url(object_key: str, expires_in: int = 3600) -> str:
    """Generate a presigned URL using the PUBLIC endpoint so browser can reach it."""
    return _public_client.generate_presigned_url(
        "get_object",
        Params={"Bucket": settings.minio_bucket, "Key": object_key},
        ExpiresIn=expires_in,
    )

