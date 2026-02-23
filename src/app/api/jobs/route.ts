import { type NextRequest, NextResponse } from "next/server";
import { createJob, getJobs } from "@/lib/services/JobService";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name") || undefined;
  const schoolId = searchParams.get("schoolId") || undefined;
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);

  try {
    const result = await getJobs({ name, schoolId, page, limit });
    return NextResponse.json(result);
  } catch (_error) {
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const job = await createJob(body);
    return NextResponse.json(job, { status: 201 });
  } catch (_error) {
    return NextResponse.json(
      { error: "Failed to create job" },
      { status: 500 },
    );
  }
}
