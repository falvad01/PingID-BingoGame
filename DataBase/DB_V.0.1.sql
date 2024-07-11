CREATE TABLE [users] (
  [id] integer PRIMARY KEY,
  [username] nvarchar(255),
  [name_surname] nvarchar(255),
  [password] nvarchar(255),
  [created_at] timestamp
)
GO

CREATE TABLE [number] (
  [id] integer PRIMARY KEY,
  [user_id] nvarchar(255),
  [number] integer,
  [created_at] timestamp
)
GO

ALTER TABLE [number] ADD FOREIGN KEY ([user_id]) REFERENCES [users] ([id])
GO
