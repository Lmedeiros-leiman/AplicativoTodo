CREATE TABLE `todo_items` (
	`database_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`reference_id` text NOT NULL,
	`title` text NOT NULL,
	`body` text NOT NULL,
	`category` text NOT NULL,
	`status` text NOT NULL,
	`created_at` integer NOT NULL,
	`lastly_updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `todo_items_reference_id_unique` ON `todo_items` (`reference_id`);