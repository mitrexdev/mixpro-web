export function paginate<T>(
  items: T[],
  requestedPage: string | undefined,
  pageSize = 8,
) {
  const pages = Math.max(1, Math.ceil(items.length / pageSize));
  const parsed =
    requestedPage && /^[1-9]\d*$/.test(requestedPage)
      ? Number(requestedPage)
      : 1;
  const page = Math.min(pages, Number.isSafeInteger(parsed) ? parsed : 1);
  const offset = (page - 1) * pageSize;
  return {
    page,
    pages,
    total: items.length,
    start: items.length ? offset + 1 : 0,
    end: Math.min(offset + pageSize, items.length),
    items: items.slice(offset, offset + pageSize),
  };
}
export function pageNumbers(page: number, total: number): (number | "gap")[] {
  const numbers = Array.from(
    new Set([
      1,
      total,
      page - 1,
      page,
      page + 1,
      ...(page <= 3 ? [2, 3, 4] : []),
      ...(page >= total - 2 ? [total - 3, total - 2, total - 1] : []),
    ]),
  )
    .filter((value) => value >= 1 && value <= total)
    .sort((a, b) => a - b);
  const result: (number | "gap")[] = [];
  numbers.forEach((value, index) => {
    if (index && value - numbers[index - 1] > 1) result.push("gap");
    result.push(value);
  });
  return result;
}
