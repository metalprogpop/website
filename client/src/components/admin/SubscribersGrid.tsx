import { Fragment } from "react";
import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { SubscriberRow } from "shared";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { subscriberColumns } from "./subscriberColumns";
import { SubscriberDetail } from "./SubscriberDetail";

type SubscribersGridProps = {
  rows: SubscriberRow[];
};

export function SubscribersGrid({ rows }: SubscribersGridProps) {
  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table v8 is not React Compiler-safe; this app does not use the compiler.
  const table = useReactTable({
    data: rows,
    columns: subscriberColumns,
    getRowId: (row) => String(row.id),
    getRowCanExpand: () => true,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  });

  if (rows.length === 0) {
    return (
      <p className="py-12 text-center text-text-muted">
        No hay suscriptores que coincidan con la búsqueda.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader className="sticky top-0 bg-surface">
        {table.getHeaderGroups().map((group) => (
          <TableRow key={group.id}>
            {group.headers.map((header) => (
              <TableHead key={header.id} className="text-text-secondary">
                {flexRender(
                  header.column.columnDef.header,
                  header.getContext(),
                )}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map((row) => (
          <Fragment key={row.id}>
            <TableRow>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id} className="px-1 py-1">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
            {row.getIsExpanded() ? (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={row.getVisibleCells().length}
                  className="bg-background p-3"
                >
                  <SubscriberDetail subscriber={row.original} />
                </TableCell>
              </TableRow>
            ) : null}
          </Fragment>
        ))}
      </TableBody>
    </Table>
  );
}
