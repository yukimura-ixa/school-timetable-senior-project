-- AlterTable
ALTER TABLE "teachers_responsibility" ADD COLUMN     "DefaultRoomID" INTEGER;

-- AddForeignKey
ALTER TABLE "teachers_responsibility" ADD CONSTRAINT "teachers_responsibility_DefaultRoomID_fkey" FOREIGN KEY ("DefaultRoomID") REFERENCES "room"("RoomID") ON DELETE SET NULL ON UPDATE CASCADE;
