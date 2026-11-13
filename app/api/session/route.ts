export function GET() {
  return Response.json(
    { user: null, guest: true },
    { headers: { "Cache-Control": "no-store" } },
  );
}
