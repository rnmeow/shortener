CREATE TABLE `URLs` (
	`slug` text(16) PRIMARY KEY NOT NULL,
	`destination` text(2048) NOT NULL,
	`createdAt` text(32) DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `URLs_slug_unique` ON `URLs` (`slug`);