"""MinIO client for the worker — reads raw images from object storage."""

import io
import boto3
from botocore.client import Config

from config import settings


def _make_client():
    return boto3.client(
        "s3",
        endpoint_url=f"http{'s' if settings.minio_secure else ''}://{settings.minio_endpoint}",
        aws_access_key_id=settings.minio_access_key,
        aws_secret_access_key=settings.minio_secret_key,
        config=Config(signature_version="s3v4"),
        region_name="us-east-1",
    )


_client = _make_client()


def read_object_bytes(object_key: str) -> bytes:
    """Download an object from MinIO and return its raw bytes."""
    buf = io.BytesIO()
    _client.download_fileobj(settings.minio_bucket, object_key, buf)
    buf.seek(0)
    return buf.read()
