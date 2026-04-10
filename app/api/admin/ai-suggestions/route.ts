import { NextRequest, NextResponse } from "next/server";

export async function GET(_req: NextRequest) {
  try {
    const suggestions = [
      {
        id: "1",
        name: "Ethical AI Reviewer",
        description: "Evaluate AI outputs for bias, fairness, and responsible use across platform content",
        priority: "High" as const,
      },
      {
        id: "2",
        name: "Sustainability Auditor",
        description: "Audit content and operations for environmental and social sustainability practices",
        priority: "High" as const,
      },
      {
        id: "3",
        name: "Prompt Architect",
        description: "Design, test, and optimize AI prompts for content generation and editorial workflows",
        priority: "High" as const,
      },
      {
        id: "4",
        name: "AI Content Strategist",
        description: "Plan and execute AI-driven content strategies aligned with audience engagement metrics",
        priority: "Medium" as const,
      },
      {
        id: "5",
        name: "Data Ethics Analyst",
        description: "Ensure data collection and usage comply with privacy regulations and ethical standards",
        priority: "Medium" as const,
      },
      {
        id: "6",
        name: "AI Editorial Lead",
        description: "Oversee AI-assisted editorial pipelines and maintain quality standards",
        priority: "Low" as const,
      },
    ];

    return NextResponse.json(suggestions);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch AI suggestions" },
      { status: 500 }
    );
  }
}
