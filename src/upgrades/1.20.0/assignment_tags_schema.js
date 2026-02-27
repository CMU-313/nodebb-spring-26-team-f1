'use strict';

const nconf = require('nconf');
const db = require('../../database');

module.exports = {
	name: 'Create assignment tags schema',
	timestamp: Date.UTC(2026, 1, 27),
	method: async function () {
		const { progress } = this;

		// Only run for PostgreSQL - MongoDB uses a different data model
		if (nconf.get('database') !== 'postgres') {
			progress.incr(0);
			return;
		}

		await db.pool.query(`
BEGIN TRANSACTION;

-- Create assignment_tags table
CREATE TABLE IF NOT EXISTS "assignment_tags" (
	"id" SERIAL PRIMARY KEY,
	"name" VARCHAR(255) NOT NULL,
	"color" VARCHAR(7) DEFAULT '#3498db',
	"category" VARCHAR(255),
	"created_at" TIMESTAMPTZ DEFAULT NOW(),
	"updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on name for faster lookups
CREATE INDEX IF NOT EXISTS "idx_assignment_tags_name" ON "assignment_tags"("name");

-- Create index on category for filtering
CREATE INDEX IF NOT EXISTS "idx_assignment_tags_category" ON "assignment_tags"("category");

-- Create post_tags junction table
CREATE TABLE IF NOT EXISTS "post_tags" (
	"post_id" INTEGER NOT NULL,
	"tag_id" INTEGER NOT NULL,
	"created_at" TIMESTAMPTZ DEFAULT NOW(),
	PRIMARY KEY ("post_id", "tag_id")
);

-- Note: Foreign key to posts would be to the objects table in NodeBB's schema
-- We'll add the tag_id foreign key with cascading delete
ALTER TABLE "post_tags"
	DROP CONSTRAINT IF EXISTS "fk_post_tags_tag_id";

ALTER TABLE "post_tags"
	ADD CONSTRAINT "fk_post_tags_tag_id"
	FOREIGN KEY ("tag_id")
	REFERENCES "assignment_tags"("id")
	ON DELETE CASCADE;

-- Create indexes for the junction table
CREATE INDEX IF NOT EXISTS "idx_post_tags_post_id" ON "post_tags"("post_id");
CREATE INDEX IF NOT EXISTS "idx_post_tags_tag_id" ON "post_tags"("tag_id");

COMMIT;
		`);

		progress.incr(1);
	},
};
