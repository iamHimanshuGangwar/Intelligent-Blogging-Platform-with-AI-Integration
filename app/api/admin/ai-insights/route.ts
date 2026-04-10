import { NextRequest, NextResponse } from "next/server";

export async function GET(_req: NextRequest) {
  try {
    const insight = {
      trend: "Quantum Computing",
      increase: 40,
      topic: "Qubit Architecture",
      category: "Quantum Tech",
      suggestedTrack: "Quantum Computing Specialist",
    };

    return NextResponse.json(insight);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch AI insights" },
      { status: 500 }
    );
  }
}
