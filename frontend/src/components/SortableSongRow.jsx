import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TableRow } from "@/components/ui/table";

export function SortableSongRow({ song, children }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: song._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <TableRow ref={setNodeRef} style={style} {...attributes} {...listeners} className="cursor-grab group h-16">
      {children}
    </TableRow>
  );
}
