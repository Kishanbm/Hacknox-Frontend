CREATE TABLE IF NOT EXISTS "public"."Hackathons" (
    "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) UNIQUE NOT NULL, -- Optimization: Use for clean URLs and fast lookups
    "status" TEXT DEFAULT 'pending'::TEXT, -- e.g., 'pending', 'active', 'archived'
    "submission_deadline" TIMESTAMP WITH TIME ZONE NOT NULL,
    "max_team_size" INTEGER DEFAULT 4 NOT NULL,
    "event_info_json" JSONB DEFAULT '{}'::JSONB, -- For rules, judging criteria, etc.
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Optimization: Add indexing on the slug for fast routing
CREATE INDEX IF NOT EXISTS "idx_hackathons_slug" ON "public"."Hackathons" ("slug");
