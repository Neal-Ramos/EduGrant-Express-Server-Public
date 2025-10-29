-- AlterTable
ALTER TABLE "public"."Account" ADD COLUMN     "webTours" JSONB NOT NULL DEFAULT '{"dashboardTour":false}';
