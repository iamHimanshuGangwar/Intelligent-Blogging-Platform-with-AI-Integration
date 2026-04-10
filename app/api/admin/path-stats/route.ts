import { NextRequest, NextResponse } from "next/server";

export async function GET(_req: NextRequest) {
  try {
    const stats = {
      avgLevelUpTime: "4.2 Months",
      platformRetention: "89.4%",
      totalCreators: 12520,
      activeCareerPaths: 15,
      totalLevels: 45,
    };

    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch path stats" },
      { status: 500 }
    );
  }
}
