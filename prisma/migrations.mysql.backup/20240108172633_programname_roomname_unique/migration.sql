/*
  Warnings:

  - A unique constraint covering the columns `[ProgramName]` on the table `program` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[RoomName]` on the table `room` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `program_ProgramName_key` ON `program`(`ProgramName`);

-- CreateIndex
CREATE UNIQUE INDEX `room_RoomName_key` ON `room`(`RoomName`);
