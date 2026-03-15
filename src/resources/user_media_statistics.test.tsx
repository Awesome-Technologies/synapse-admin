import { render, screen, fireEvent } from "@testing-library/react";
import resource, { UserMediaStatsList, ListActions } from "./user_media_statistics";

const {
  mockedDataTable,
  mockedCreatePath,
  mockedUseListContext,
  MockNumberField,
  MockTextField,
} = vi.hoisted(() => {
    const MockNumberField = ({ source }) => <span data-testid="number-field">{source}</span>;
    const MockTextField = ({ source }) => <span data-testid="text-field">{source}</span>;
    return {
        mockedDataTable: vi.fn(({ children, rowClick }) => <div data-testid="data-table" onClick={() => rowClick("test-id")}>{children}</div>),
        mockedCreatePath: vi.fn(),
        mockedUseListContext: vi.fn(),
        MockNumberField,
        MockTextField
    };
});

vi.mock("react-admin", async importOriginal => {
  const actual = await importOriginal<typeof import("react-admin")>();
  return {
    ...actual,
    List: ({ children, actions, filters, pagination, sort }) => (
        <div data-testid="list">
            {actions}
            {filters}
            {children}
            {pagination}
            <div data-testid="sort-info" data-field={sort.field} data-order={sort.order}></div>
        </div>
    ),
    DataTable: Object.assign(mockedDataTable, {
      Col: ({ source }) => {
        if (source === 'media_count' || source === 'media_length') {
          return <MockNumberField source={source} />;
        }
        return <MockTextField source={source} />;
      },
    }),
    NumberField: MockNumberField,
    TextField: MockTextField,
    SearchInput: () => <div data-testid="search-input" />,
    Pagination: () => <div data-testid="pagination" />,
    TopToolbar: ({ children }) => <div data-testid="top-toolbar">{children}</div>,
    ExportButton: ({ disabled }) => <button data-testid="export-button" disabled={disabled} />,
    useCreatePath: () => mockedCreatePath,
    useListContext: mockedUseListContext,
  };
});

vi.mock("../components/media", () => ({
    DeleteMediaButton: () => <button data-testid="delete-media-button" />
}));


describe("UserMediaStatsList", () => {
    beforeEach(() => {
        mockedCreatePath.mockClear();
    });

    it("should render the list with the correct columns and default sort", () => {
        mockedUseListContext.mockReturnValue({
            isLoading: false,
            total: 1,
        });
        render(<UserMediaStatsList />);

        expect(screen.getByTestId("list")).toBeTruthy();
        expect(screen.getByTestId("data-table")).toBeTruthy();
        expect(screen.getByTestId("search-input")).toBeTruthy();
        expect(screen.getByTestId("pagination")).toBeTruthy();

        const textFields = screen.getAllByTestId("text-field");
        expect(textFields[0].textContent).toBe("user_id");
        expect(textFields[1].textContent).toBe("displayname");

        const numberFields = screen.getAllByTestId("number-field");
        expect(numberFields[0].textContent).toBe("media_count");
        expect(numberFields[1].textContent).toBe("media_length");

        const sortInfo = screen.getByTestId("sort-info");
        expect(sortInfo.getAttribute('data-field')).toBe('media_length');
        expect(sortInfo.getAttribute('data-order')).toBe('DESC');
    });

    it("should handle row clicks", () => {
        mockedUseListContext.mockReturnValue({
            isLoading: false,
            total: 1,
        });
        const mockPath = "/users/test-id/edit/media";
        mockedCreatePath.mockReturnValue(mockPath);
        render(<UserMediaStatsList />);

        fireEvent.click(screen.getByTestId("data-table"));

        expect(mockedCreatePath).toHaveBeenCalledWith({ resource: "users", id: "test-id", type: "edit" });
    });
});

describe("ListActions", () => {
    it("should disable export button when loading", () => {
        mockedUseListContext.mockReturnValue({ isLoading: true, total: 1 });
        render(<ListActions />);
        expect(screen.getByTestId("export-button").hasAttribute("disabled")).toBeTruthy();
    });

    it("should disable export button when total is 0", () => {
        mockedUseListContext.mockReturnValue({ isLoading: false, total: 0 });
        render(<ListActions />);
        expect(screen.getByTestId("export-button").hasAttribute("disabled")).toBeTruthy();
    });

    it("should enable export button when not loading and total is not 0", () => {
        mockedUseListContext.mockReturnValue({ isLoading: false, total: 10 });
        render(<ListActions />);
        expect(screen.getByTestId("export-button").hasAttribute("disabled")).toBeFalsy();
    });

    it("should render DeleteMediaButton", () => {
        mockedUseListContext.mockReturnValue({ isLoading: false, total: 1 });
        render(<ListActions />);
        expect(screen.getByTestId("delete-media-button")).toBeTruthy();
    });
});

describe("recordRepresentation", () => {
    it("should return displayname if present", () => {
        const record = { user_id: "test_user", displayname: "Test User" };
        expect(resource.recordRepresentation(record)).toBe("Test User");
    });

    it("should return user_id if displayname is not present", () => {
        const record = { user_id: "test_user" };
        expect(resource.recordRepresentation(record)).toBe("test_user");
    });
});
