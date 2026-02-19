import { type NextRequest, NextResponse } from "next/server";
import { createEvent, getEvents } from "@/lib/services/EventService";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name") || undefined;
  const location = searchParams.get("location") || undefined;
  const schoolId = searchParams.get("schoolId") || undefined;
  const fromDateParam = searchParams.get("fromDate");
  const fromDate = fromDateParam ? new Date(fromDateParam) : undefined;
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);

  try {
    const result = await getEvents({
      name,
      location,
      schoolId,
      fromDate,
      page,
      limit,
    });
    return NextResponse.json(result);
  } catch (_error) {
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (body.datetime) body.datetime = new Date(body.datetime);
    const event = await createEvent(body);
    return NextResponse.json(event, { status: 201 });
  } catch (_error) {
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 },
    );
  }
}
