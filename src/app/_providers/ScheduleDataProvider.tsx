"use client";

import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import type { teacher, room } from '@/prisma/generated/client';;

/**
 * Context to provide schedule-related data (teachers, rooms) to client components
 * Data is fetched once by parent Server Component and passed down
 * Replaces legacy useTeacherData/useRoomData hooks that called non-existent API routes
 */

interface ScheduleDataContextValue {
  teachers: teacher[];
  rooms: room[];
}

const ScheduleDataContext = createContext<ScheduleDataContextValue | null>(null);

interface ScheduleDataProviderProps {
  children: ReactNode;
  teachers: teacher[];
  rooms: room[];
}

export function ScheduleDataProvider({
  children,
  teachers,
  rooms,
}: ScheduleDataProviderProps) {
  return (
    <ScheduleDataContext.Provider value={{ teachers, rooms }}>
      {children}
    </ScheduleDataContext.Provider>
  );
}

/**
 * Hook to access teacher and room data in client components
 * Replaces: useTeacherData() and useRoomData()
 * 
 * @example
 * const { teachers, rooms } = useScheduleData();
 */
export function useScheduleData() {
  const context = useContext(ScheduleDataContext);
  if (!context) {
    throw new Error(
      "useScheduleData must be used within ScheduleDataProvider"
    );
  }
  return context;
}

/**
 * Hook to access only teachers (for components that don't need rooms)
 * @example
 * const teachers = useTeachers();
 */
export function useTeachers() {
  const { teachers } = useScheduleData();
  return teachers;
}

/**
 * Hook to access only rooms (for components that don't need teachers)
 * @example
 * const rooms = useRooms();
 */
export function useRooms() {
  const { rooms } = useScheduleData();
  return rooms;
}
