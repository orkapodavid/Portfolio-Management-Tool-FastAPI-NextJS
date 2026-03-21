"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface Column {
  key: string;
  header: string;
  align?: "left" | "center" | "right";
  format?: (value: unknown) => string;
}

interface DataTableProps {
  columns: Column[];
  data: Record<string, unknown>[];
  isLoading?: boolean;
  emptyMessage?: string;
}

export function DataTable({
  columns,
  data,
  isLoading,
  emptyMessage = "No data available",
}: DataTableProps) {
  return (
    <div className="flex-1 overflow-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-[#313244] hover:bg-transparent">
            {columns.map((col) => (
              <TableHead
                key={col.key}
                className={cn(
                  "text-[11px] font-semibold text-[#a6adc8] uppercase tracking-wider h-8 px-3",
                  col.align === "right" && "text-right",
                  col.align === "center" && "text-center"
                )}
              >
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="text-center text-[#a6adc8] py-8"
              >
                Loading...
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="text-center text-[#a6adc8] py-8"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, i) => (
              <TableRow
                key={i}
                className="border-[#313244] hover:bg-[#313244]/30"
              >
                {columns.map((col) => {
                  const value = row[col.key];
                  const displayValue = col.format
                    ? col.format(value)
                    : String(value ?? "");

                  const isFinancialValue =
                    typeof displayValue === "string" &&
                    (displayValue.startsWith("+") ||
                      displayValue.startsWith("-") ||
                      displayValue.startsWith("("));
                  const isPositive =
                    displayValue.startsWith("+") ||
                    (displayValue.includes("$") &&
                      !displayValue.startsWith("-") &&
                      !displayValue.startsWith("("));
                  const isNegative =
                    displayValue.startsWith("-") ||
                    displayValue.startsWith("(");

                  return (
                    <TableCell
                      key={col.key}
                      className={cn(
                        "text-xs px-3 py-1.5",
                        col.align === "right" && "text-right",
                        col.align === "center" && "text-center",
                        isFinancialValue &&
                          isPositive &&
                          "text-[#00A651]",
                        isFinancialValue &&
                          isNegative &&
                          "text-[#C00000]"
                      )}
                    >
                      {displayValue}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
