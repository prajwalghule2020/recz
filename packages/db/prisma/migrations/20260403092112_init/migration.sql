-- CreateTable
CREATE TABLE "processing_jobs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "object_key" TEXT NOT NULL,
    "face_count" INTEGER,
    "error_msg" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "processing_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "photo_metadata" (
    "id" TEXT NOT NULL,
    "job_id" TEXT NOT NULL,
    "image_id" TEXT NOT NULL,
    "datetime_original" TIMESTAMP(3),
    "gps_lat" DOUBLE PRECISION,
    "gps_lon" DOUBLE PRECISION,
    "camera_make" TEXT,
    "camera_model" TEXT,
    "width" INTEGER,
    "height" INTEGER,

    CONSTRAINT "photo_metadata_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "face_records" (
    "id" TEXT NOT NULL,
    "job_id" TEXT NOT NULL,
    "image_id" TEXT NOT NULL,
    "face_index" INTEGER NOT NULL,
    "bbox_json" TEXT,
    "det_score" DOUBLE PRECISION,
    "qdrant_point_id" TEXT,

    CONSTRAINT "face_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "processing_jobs_user_id_idx" ON "processing_jobs"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "photo_metadata_job_id_key" ON "photo_metadata"("job_id");

-- CreateIndex
CREATE INDEX "photo_metadata_image_id_idx" ON "photo_metadata"("image_id");

-- CreateIndex
CREATE INDEX "face_records_job_id_idx" ON "face_records"("job_id");

-- CreateIndex
CREATE INDEX "face_records_image_id_idx" ON "face_records"("image_id");

-- AddForeignKey
ALTER TABLE "photo_metadata" ADD CONSTRAINT "photo_metadata_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "processing_jobs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "face_records" ADD CONSTRAINT "face_records_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "processing_jobs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
