// Display helpers for read-only admin cells.

// "2024-03-01" → "01/03/2024", without timezone shifts.
export const formatIsoDate = (date: string | null): string => {
  if (!date) {
    return "—";
  }
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
};
