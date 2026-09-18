import { prisma } from "@/lib/prisma";
import { DEMO_SPONSORS } from "./demo-data";
import { Sponsor } from "./types";

export async function getSponsors(): Promise<Sponsor[]> {
  const isDemo = process.env.DATA_SOURCE === "demo";

  if (isDemo) {
    return DEMO_SPONSORS;
  }

  const sponsors = await prisma.sponsor.findMany({
    where: {
      isPublished: true,
    },
    orderBy: { order: "asc" },
  });

  return sponsors.map((s) => ({
    id: s.id,
    editionId: s.editionId,
    name: s.name,
    tier: s.tier as Sponsor["tier"],
    logoUrl: s.logoUrl,
    websiteUrl: s.websiteUrl,
    order: s.order,
    isPublished: s.isPublished,
  }));
}