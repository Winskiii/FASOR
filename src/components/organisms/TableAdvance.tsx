import {
  Box,
  Button,
  HStack,
  Input,
  Select,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from "@tanstack/react-table";
import { rankItem } from "@tanstack/match-sorter-utils";
import type { ComponentProps } from "react";
import { useEffect, useState } from "react";
import {
  IoChevronBack,
  IoChevronBackCircle,
  IoChevronForward,
  IoChevronForwardCircle,
} from "react-icons/io5";

const fuzzyFilter = (row: any, columnId: string, value: string, addMeta: (meta: any) => void) => {
  const itemRank = rankItem(row.getValue(columnId), value);
  addMeta({ itemRank });
  return itemRank.passed;
};

const dateFilter = (row: any, columnId: string, value: string) => {
  if (!value) return true;
  const rowValue = row.getValue(columnId);
  if (!rowValue) return false;
  return String(rowValue).toLowerCase().includes(String(value).toLowerCase());
};

const DebouncedInput = ({
  value: initialValue,
  onChange,
  debounce = 300,
  ...props
}: {
  value: string | number;
  onChange: (value: string | number) => void;
  debounce?: number;
} & ComponentProps<typeof Input>) => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value);
    }, debounce);

    return () => clearTimeout(timeout);
  }, [value, debounce, onChange]);

  return (
    <Input
      {...props}
      value={value}
      onChange={(e: any) => setValue(e.target.value)}
    />
  );
};

const Filter = ({ column }: { column: any; table: any }) => {
  const columnFilterValue = column.getFilterValue();

  return (
    <Input
      mt="8px"
      value={(columnFilterValue ?? "") as string}
      onChange={(e: any) => column.setFilterValue(e.target.value)}
      placeholder="Filter..."
      size="sm"
    />
  );
};

const TableAdvance = ({
  columns,
  data,
}: {
  columns: ColumnDef<any, any>[];
  data: any[];
}) => {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const table = useReactTable({
    data,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter,
      date: dateFilter
    },
    state: {
      columnFilters,
      globalFilter,
    },
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: fuzzyFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
  });

  return (
    <>
      <TableContainer>
        <Box>
          <DebouncedInput
            value={globalFilter ?? ""}
            onChange={(value) => setGlobalFilter(String(value))}
            className="p-2 font-lg shadow border border-block"
            placeholder="Search all columns..."
          />
        </Box>
        <Table variant="unstyled">
          <Thead>
            {table.getHeaderGroups().map((headerGroup: any) => (
              <Tr key={headerGroup.id}>
                {headerGroup.headers.map((header: any) => {
                  return (
                    <Th
                      key={header.id}
                      colSpan={header.colSpan}
                      paddingBottom="16px"
                      paddingTop="0px"
                      paddingInlineEnd="0px"
                      paddingInlineStart="0px"
                      _first={{
                        paddingInlineStart: "24px",
                      }}
                      _last={{
                        paddingInlineEnd: "24px",
                      }}
                    >
                      {header.isPlaceholder ? null : (
                        <>
                          <Box
                            {...{
                              className: header.column.getCanSort()
                                ? "cursor-pointer select-none"
                                : "",
                              onClick: header.column.getToggleSortingHandler(),
                            }}
                          >
                            <Text textAlign="center">
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                              {{
                                asc: " 🔼",
                                desc: " 🔽",
                              }[header.column.getIsSorted() as string] ?? null}
                            </Text>
                          </Box>
                          {header.column.getCanFilter() ? (
                            <Box>
                              <Filter column={header.column} table={table} />
                            </Box>
                          ) : null}
                        </>
                      )}
                    </Th>
                  );
                })}
              </Tr>
            ))}
          </Thead>
          <Tbody>
            {table.getRowModel().rows.map((row: any) => {
              return (
                <Tr key={row.id}>
                  {row.getVisibleCells().map((cell: any) => {
                    return (
                      <Td key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </Td>
                    );
                  })}
                </Tr>
              );
            })}
          </Tbody>
        </Table>
        <HStack justifyContent="space-between" marginTop="30px">
          <HStack>
            <Button
              className="border rounded p-1"
              onClick={() => table.setPageIndex(0)}
              isDisabled={!table.getCanPreviousPage()}
            >
              <IoChevronBackCircle />
            </Button>
            <Button
              className="border rounded p-1"
              onClick={() => table.previousPage()}
              isDisabled={!table.getCanPreviousPage()}
            >
              <IoChevronBack />
            </Button>
            <Button
              className="border rounded p-1"
              onClick={() => table.nextPage()}
              isDisabled={!table.getCanNextPage()}
            >
              <IoChevronForward />
            </Button>
            <Button
              className="border rounded p-1"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              isDisabled={!table.getCanNextPage()}
            >
              <IoChevronForwardCircle />
            </Button>
            <Box as="span">
              <Text>
                {"Page "}
                {table.getState().pagination.pageIndex + 1} of{" "}
                {table.getPageCount()}
              </Text>
            </Box>
            <Box as="span">
              | Go to page:
              <Input
                width="fit-content"
                type="number"
                defaultValue={table.getState().pagination.pageIndex + 1}
                onChange={(e: any) => {
                  const page = e.target.value ? Number(e.target.value) - 1 : 0;
                  if (page < table.getPageCount()) {
                    table.setPageIndex(page);
                  }
                }}
                min={1}
                max={table.getPageCount()}
              />
            </Box>
          </HStack>
          <HStack>
            <Select
              value={table.getState().pagination.pageSize}
              onChange={(e: any) => {
                table.setPageSize(Number(e.target.value));
              }}
            >
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  Show {pageSize}
                </option>
              ))}
            </Select>
          </HStack>
        </HStack>
      </TableContainer>
    </>
  );
};

export default TableAdvance;
