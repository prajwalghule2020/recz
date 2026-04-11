"""MinIO client for the worker — reads raw images from object storage."""

import io
import boto3
from botocore.client import Config

from config import settings


def _make_client():
    return boto3.client(
        "s3",
        endpoint_url=f"http://{settings.minio_endpoint}",
        aws_access_key_id=settings.minio_access_key,
        aws_secret_access_key=settings.minio_secret_key,
        config=Config(signature_version="s3v4"),
        region_name="us-east-1",
        use_ssl=False,
        verify=False,
    )


_client = _make_client()


def read_object_bytes(object_key: str) -> bytes:
    """Download an object from MinIO and return its raw bytes."""
    buf = io.BytesIO()
    _client.download_fileobj(settings.minio_bucket, object_key, buf)
    buf.seek(0)
    return buf.read()


def upload_object(object_key: str, data: bytes, content_type: str = "application/octet-stream") -> None:
    """Upload bytes to MinIO."""
    _client.upload_fileobj(
        io.BytesIO(data),
        settings.minio_bucket,
        object_key,
        ExtraArgs={"ContentType": content_type},
    )

