import { render, screen } from "@testing-library/react";

const { mockedDataTableCol, mockedDataTableNumberCol } = vi.hoisted(() => ({
  mockedDataTableCol: vi.fn(({ source }: { source: string }) => <span data-testid="data-table-col">{source}</span>),
  mockedDataTableNumberCol: vi.fn(({ source }: { source: string }) => (
    <span data-testid="data-table-number-col">{source}</span>
  )),
}));

vi.mock("react-admin", async importOriginal => {
  const actual = await importOriginal<typeof import("react-admin")>();

  const mockedDataTable = Object.assign(
    ({ children }: { children: React.ReactNode }) => <div data-testid="data-table">{children}</div>,
    {
      Col: mockedDataTableCol,
      NumberCol: mockedDataTableNumberCol,
    }
  );

  return {
    ...actual,
    List: ({ children }: { children: React.ReactNode }) => <div data-testid="list">{children}</div>,
    DataTable: mockedDataTable,
  };
});

import { ReportList } from "./reports";

describe("ReportList", () => {
  it("uses DataTable columns for the report overview", () => {
    render(<ReportList />);

    expect(screen.getByTestId("data-table")).toBeTruthy();
    expect(mockedDataTableCol).toHaveBeenCalledWith(expect.objectContaining({ source: "id" }), undefined);
    expect(mockedDataTableCol).toHaveBeenCalledWith(expect.objectContaining({ source: "received_ts" }), undefined);
    expect(mockedDataTableCol).toHaveBeenCalledWith(expect.objectContaining({ source: "user_id" }), undefined);
    expect(mockedDataTableCol).toHaveBeenCalledWith(expect.objectContaining({ source: "name" }), undefined);
    expect(mockedDataTableNumberCol).toHaveBeenCalledWith(expect.objectContaining({ source: "score" }), undefined);
  });
});
