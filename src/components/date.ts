export const DATE_FORMAT: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
};

export const dateParser = (v: string | number | Date | null | undefined): number | null => {
  if (v === "" || v === null || v === undefined) {
    return null;
  }

  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d.getTime();
};

export const dateFormatter = (v: string | number | Date | undefined | null): string => {
  if (v === undefined || v === null) return "";
  const d = new Date(v);

  const pad = "00";
  const year = d.getFullYear().toString();
  const month = (pad + (d.getMonth() + 1).toString()).slice(-2);
  const day = (pad + d.getDate().toString()).slice(-2);
  const hour = (pad + d.getHours().toString()).slice(-2);
  const minute = (pad + d.getMinutes().toString()).slice(-2);

  // target format yyyy-MM-ddThh:mm
  return `${year}-${month}-${day}T${hour}:${minute}`;
};
