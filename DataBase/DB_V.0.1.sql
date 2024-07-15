CREATE TABLE `users` (
  `id` integer PRIMARY KEY,
  `username` varchar(255),
  `name_surname` varchar(255),
  `password` varchar(255),
  `created_at` timestamp
);

CREATE TABLE `number` (
  `id` integer PRIMARY KEY,
  `user_id` varchar(255),
  `number` integer,
  `created_at` timestamp
);

ALTER TABLE `number` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);
