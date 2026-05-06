import { getOperationsContextMenuItems } from "@/components/operations/operations-context-menu";

type MenuItem = { name?: string; action?: () => void } | string;

const fakeParams = (data: Record<string, unknown> | undefined) =>
  ({
    node: data === undefined ? null : ({ data } as { data: unknown }),
  }) as unknown as Parameters<ReturnType<typeof getOperationsContextMenuItems>>[0];

describe("operations context menu", () => {
  it("prepends Rerun + Kill ahead of the AG Grid default items", () => {
    const onRerun = jest.fn();
    const onKill = jest.fn();
    const builder = getOperationsContextMenuItems({ onRerun, onKill });
    const items = builder(
      fakeParams({ id: 7, process: "Bloomberg Feed" }),
    ) as MenuItem[];
    expect(items).toHaveLength(7);
    expect((items[0] as { name: string }).name).toBe("Rerun");
    expect((items[1] as { name: string }).name).toBe("Kill");
    expect(items[2]).toBe("separator");
    expect(items[3]).toBe("copy");
    expect(items[4]).toBe("copyWithHeaders");
    expect(items[5]).toBe("separator");
    expect(items[6]).toBe("export");
  });

  it("invokes onRerun with row id + process name from the AG Grid node", () => {
    const onRerun = jest.fn();
    const onKill = jest.fn();
    const builder = getOperationsContextMenuItems({ onRerun, onKill });
    const items = builder(
      fakeParams({ id: 42, process: "Risk Engine" }),
    ) as MenuItem[];
    (items[0] as { action: () => void }).action();
    expect(onRerun).toHaveBeenCalledWith({ id: 42, process_name: "Risk Engine" });
    expect(onKill).not.toHaveBeenCalled();
  });

  it("falls back to procedure_name on daily-procedures rows", () => {
    const onRerun = jest.fn();
    const onKill = jest.fn();
    const builder = getOperationsContextMenuItems({ onRerun, onKill });
    const items = builder(
      fakeParams({ id: 3, procedure_name: "Risk Calculation" }),
    ) as MenuItem[];
    (items[1] as { action: () => void }).action();
    expect(onKill).toHaveBeenCalledWith({
      id: 3,
      process_name: "Risk Calculation",
    });
  });

  it("uses sentinel id=0 + name='Unknown' when params have no node data", () => {
    const onRerun = jest.fn();
    const onKill = jest.fn();
    const builder = getOperationsContextMenuItems({ onRerun, onKill });
    const items = builder(fakeParams(undefined)) as MenuItem[];
    (items[0] as { action: () => void }).action();
    expect(onRerun).toHaveBeenCalledWith({ id: 0, process_name: "Unknown" });
  });

});
