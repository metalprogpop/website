// Display helpers for read-only admin cells.

const amountFormat = new Intl.NumberFormat("es-AR", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export const formatAmount = (amount: string | null): string =>
  amount === null ? "—" : amountFormat.format(Number(amount));

// "2024-03-01" → "01/03/2024", without timezone shifts.
export const formatIsoDate = (date: string | null): string => {
  if (!date) {
    return "—";
  }
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
};
