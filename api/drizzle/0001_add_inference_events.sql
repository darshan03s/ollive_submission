CREATE TYPE "public"."inference_status" AS ENUM('success', 'error');--> statement-breakpoint
CREATE TABLE "inference_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" text NOT NULL,
	"provider" text NOT NULL,
	"model" text NOT NULL,
	"latency_ms" integer NOT NULL,
	"input_tokens" integer NOT NULL,
	"output_tokens" integer NOT NULL,
	"status" "inference_status" NOT NULL,
	"timestamp" timestamp NOT NULL
);
--> statement-breakpoint
DROP TABLE "test" CASCADE;