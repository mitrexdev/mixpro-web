export function POST() {
  return Response.json(
    {
      error:
        "Accounts are currently disabled. You can watch without signing in.",
    },
    { status: 410 },
  );
}
