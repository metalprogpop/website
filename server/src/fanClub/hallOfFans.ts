type NameParts = {
  fanName: string | null;
  firstName: string | null;
  lastName: string | null;
};

const clean = (value: string | null): string | null => {
  const trimmed = value?.trim() ?? "";
  return trimmed === "" ? null : trimmed;
};

// How a subscriber appears in the public Hall of Fans: the fan name they
// chose, otherwise their full name. Null when there is nothing to show.
export const hallOfFansName = ({
  fanName,
  firstName,
  lastName,
}: NameParts): string | null => {
  const chosen = clean(fanName);
  if (chosen !== null) {
    return chosen;
  }
  const fullName = [clean(firstName), clean(lastName)]
    .filter((part) => part !== null)
    .join(" ");
  return fullName === "" ? null : fullName;
};
