-- AlterTable
ALTER TABLE "face_records" ADD COLUMN     "person_id" TEXT;

-- AlterTable
ALTER TABLE "processing_jobs" ADD COLUMN     "thumbnail_key" TEXT;

-- CreateTable
CREATE TABLE "persons" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT,
    "cover_face_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "persons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "cover_image_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_photos" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "job_id" TEXT NOT NULL,

    CONSTRAINT "event_photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "places" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT,
    "lat" DOUBLE PRECISION NOT NULL,
    "lon" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "places_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "place_photos" (
    "id" TEXT NOT NULL,
    "place_id" TEXT NOT NULL,
    "job_id" TEXT NOT NULL,

    CONSTRAINT "place_photos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "persons_user_id_idx" ON "persons"("user_id");

-- CreateIndex
CREATE INDEX "events_user_id_idx" ON "events"("user_id");

-- CreateIndex
CREATE INDEX "events_start_time_idx" ON "events"("start_time");

-- CreateIndex
CREATE UNIQUE INDEX "event_photos_event_id_job_id_key" ON "event_photos"("event_id", "job_id");

-- CreateIndex
CREATE INDEX "places_user_id_idx" ON "places"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "place_photos_place_id_job_id_key" ON "place_photos"("place_id", "job_id");

-- CreateIndex
CREATE INDEX "face_records_person_id_idx" ON "face_records"("person_id");

-- CreateIndex
CREATE INDEX "photo_metadata_datetime_original_idx" ON "photo_metadata"("datetime_original");

-- AddForeignKey
ALTER TABLE "face_records" ADD CONSTRAINT "face_records_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "persons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_photos" ADD CONSTRAINT "event_photos_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_photos" ADD CONSTRAINT "event_photos_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "processing_jobs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "place_photos" ADD CONSTRAINT "place_photos_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "places"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "place_photos" ADD CONSTRAINT "place_photos_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "processing_jobs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
