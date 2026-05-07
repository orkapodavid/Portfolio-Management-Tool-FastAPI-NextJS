import type {
  DefaultMenuItem,
  GetContextMenuItems,
  GetContextMenuItemsParams,
  MenuItemDef,
} from "ag-grid-community";

type OperationsRow = {
  id?: number;
  process?: string;
  procedure_name?: string;
};

export type OperationsContextMenuOptions = {
  onRerun: (row: { id: number; process_name: string }) => void | Promise<void>;
  onKill: (row: { id: number; process_name: string }) => void | Promise<void>;
};

const ICON_RERUN = '<span style="font-size:14px;margin-right:6px">🔄</span>';
const ICON_KILL = '<span style="font-size:14px;margin-right:6px">🛑</span>';

const resolveProcessName = (row: OperationsRow): string =>
  row.process ?? row.procedure_name ?? "Unknown";

export function getOperationsContextMenuItems(
  options: OperationsContextMenuOptions,
): GetContextMenuItems {
  return (
    params: GetContextMenuItemsParams,
  ): (MenuItemDef | DefaultMenuItem)[] => {
    const data = (params.node?.data ?? {}) as OperationsRow;
    const processId = data.id ?? 0;
    const processName = resolveProcessName(data);

    return [
      {
        name: "Rerun",
        icon: ICON_RERUN,
        action: () => {
          void options.onRerun({ id: processId, process_name: processName });
        },
      },
      {
        name: "Kill",
        icon: ICON_KILL,
        action: () => {
          void options.onKill({ id: processId, process_name: processName });
        },
      },
      "separator",
      "copy",
      "copyWithHeaders",
      "separator",
      "export",
    ];
  };
}
