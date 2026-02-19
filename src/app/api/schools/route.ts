import { type NextRequest, NextResponse } from "next/server";
import { createSchool, getSchools } from "@/lib/services/SchoolService";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name") || undefined;
  const location = searchParams.get("location") || undefined;
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);

  try {
    const result = await getSchools({ name, location, page, limit });
    return NextResponse.json(result);
  } catch (_error) {
    return NextResponse.json(
      { error: "Failed to fetch schools" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const school = await createSchool(body);
    return NextResponse.json(school, { status: 201 });
  } catch (_error) {
    return NextResponse.json(
      { error: "Failed to create school" },
      { status: 500 },
    );
  }
}
