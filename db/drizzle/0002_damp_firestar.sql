ALTER TYPE "public"."inference_status" ADD VALUE 'aborted';--> statement-breakpoint
ALTER TABLE "inference_events" ALTER COLUMN "input_tokens" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "inference_events" ALTER COLUMN "output_tokens" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "inference_events" ADD COLUMN "total_tokens" integer;--> statement-breakpoint
ALTER TABLE "inference_events" ADD COLUMN "input_preview" text NOT NULL;--> statement-breakpoint
ALTER TABLE "inference_events" ADD COLUMN "output_preview" text NOT NULL;--> statement-breakpoint
ALTER TABLE "inference_events" ADD COLUMN "start_timestamp" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "inference_events" ADD COLUMN "end_timestamp" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "inference_events" DROP COLUMN "conversation_id";--> statement-breakpoint
ALTER TABLE "inference_events" DROP COLUMN "timestamp";