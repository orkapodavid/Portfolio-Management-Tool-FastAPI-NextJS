import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { useState } from "react";

import {
  RESET_DATES_DEFAULT_FILTERS,
  ResetDatesFilterBar,
  type ResetDatesFilterState,
} from "@/components/grid/reset-dates-filter-bar";

function Harness({
  onApply,
}: {
  onApply: (filters: ResetDatesFilterState) => void;
}) {
  const [filters, setFilters] = useState(RESET_DATES_DEFAULT_FILTERS);

  return (
    <ResetDatesFilterBar
      value={filters}
      onChange={setFilters}
      onApply={() => onApply(filters)}
    />
  );
}

describe("ResetDatesFilterBar", () => {
  it("renders Reflex default filters and submits edited values", () => {
    const onApply = jest.fn();
    render(<Harness onApply={onApply} />);

    expect(screen.getByLabelText("Select Ticker")).toHaveValue(
      "4592 JP_Series 1",
    );
    expect(screen.getByLabelText("Start/End Date")).toHaveValue("2026-03-03");
    expect(screen.getByLabelText("End Date")).toHaveValue("2029-03-08");

    fireEvent.change(screen.getByLabelText("Select Ticker"), {
      target: { value: "9984 JP_Series 2" },
    });
    fireEvent.change(screen.getByLabelText("Reset Freq"), {
      target: { value: "quarterly" },
    });
    fireEvent.change(screen.getByLabelText("Reset Month"), {
      target: { value: "6" },
    });
    fireEvent.change(screen.getByLabelText("Reset On Day"), {
      target: { value: "15" },
    });
    fireEvent.click(screen.getByRole("button", { name: /apply/i }));

    expect(onApply).toHaveBeenCalledWith({
      ...RESET_DATES_DEFAULT_FILTERS,
      ticker: "9984 JP_Series 2",
      frequency: "quarterly",
      reset_month: "6",
      reset_day: "15",
    });
  });
});
