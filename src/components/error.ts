export type MatrixError = {
	errcode: string;
	error: string;
}

export const displayError = (errcode: string, status: number, message: string) => `${errcode} (${status}): ${message}`;