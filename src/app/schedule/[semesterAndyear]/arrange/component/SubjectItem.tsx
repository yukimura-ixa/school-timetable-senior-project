/**
 * SubjectItem Component - Refactored with @dnd-kit
 * 
 * Week 6.1 - Component Migration
 * Migrated from react-beautiful-dnd to @dnd-kit for better performance
 */

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SubjectItemData {
  SubjectCode: string;
  SubjectName: string;
  GradeID: string;
  itemID?: number;
}

interface ISubjectItemProps {
  item: SubjectItemData;
  index: number;
  teacherData: {
    Firstname: string;
  };
  storeSelectedSubject: any;
  clickOrDragToSelectSubject: any;
  dropOutOfZone?: any;
}

function SubjectItem({
  item,
  index,
  teacherData,
  storeSelectedSubject,
  clickOrDragToSelectSubject,
  dropOutOfZone,
}: ISubjectItemProps) {
  // @dnd-kit sortable hook
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `${item.SubjectCode}-Grade-${item.GradeID}-Index-${index}`,
    data: {
      type: "subject",
      item,
      index,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Check if this item is currently selected
  const isSelected = storeSelectedSubject === item ||
    storeSelectedSubject?.SubjectCode === item.SubjectCode;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`w-[85%] h-fit flex flex-col my-1 py-1 border rounded cursor-pointer ${
        isSelected
          ? "bg-green-200 hover:bg-green-300 border-green-500 animate-pulse"
          : "bg-white hover:bg-slate-50"
      } duration-100 select-none`}
      onClick={() => clickOrDragToSelectSubject(item)}
    >
      <b className="text-sm">{item.SubjectCode}</b>
      <p className="text-sm">{item.SubjectName.substring(0, 8)}...</p>
      <b className="text-xs">
        ม.{item.GradeID[0]}/
        {parseInt(item.GradeID.substring(1, 2)) < 10
          ? item.GradeID[2]
          : item.GradeID.substring(1, 2)}
      </b>
      <div className="flex gap-1 justify-center">
        <p className="text-xs">{teacherData.Firstname}</p>
      </div>
    </div>
  );
}

export default SubjectItem;