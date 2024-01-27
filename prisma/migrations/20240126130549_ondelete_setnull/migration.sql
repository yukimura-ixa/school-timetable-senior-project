-- DropForeignKey
ALTER TABLE `class_schedule` DROP FOREIGN KEY `class_schedule_RoomID_fkey`;

-- DropForeignKey
ALTER TABLE `gradelevel` DROP FOREIGN KEY `gradelevel_ProgramID_fkey`;

-- DropForeignKey
ALTER TABLE `subject` DROP FOREIGN KEY `subject_ProgramID_fkey`;

-- AddForeignKey
ALTER TABLE `class_schedule` ADD CONSTRAINT `class_schedule_RoomID_fkey` FOREIGN KEY (`RoomID`) REFERENCES `room`(`RoomID`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `gradelevel` ADD CONSTRAINT `gradelevel_ProgramID_fkey` FOREIGN KEY (`ProgramID`) REFERENCES `program`(`ProgramID`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subject` ADD CONSTRAINT `subject_ProgramID_fkey` FOREIGN KEY (`ProgramID`) REFERENCES `program`(`ProgramID`) ON DELETE SET NULL ON UPDATE CASCADE;
