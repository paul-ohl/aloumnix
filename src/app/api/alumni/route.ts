import { type NextRequest, NextResponse } from "next/server";
import { createAlumnus, getAlumni } from "@/lib/services/AlumnusService";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const fullName = searchParams.get("fullName") || undefined;
  const graduationYearParam = searchParams.get("graduationYear");
  const graduationYear = graduationYearParam
    ? parseInt(graduationYearParam, 10)
    : undefined;
  const className = searchParams.get("class") || undefined;
  const schoolSector = searchParams.get("schoolSector") || undefined;
  const professionalStatus =
    searchParams.get("professionalStatus") || undefined;
  const schoolId = searchParams.get("schoolId") || undefined;
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);

  try {
    const result = await getAlumni({
      fullName,
      graduationYear,
      class: className,
      schoolSector,
      professionalStatus,
      schoolId,
      page,
      limit,
    });
    return NextResponse.json(result);
  } catch (_error) {
    return NextResponse.json(
      { error: "Failed to fetch alumni" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const alumnus = await createAlumnus(body);
    return NextResponse.json(alumnus, { status: 201 });
  } catch (_error) {
    return NextResponse.json(
      { error: "Failed to create alumnus" },
      { status: 500 },
    );
  }
}
