import { prisma } from "@/lib/prisma";
import { DEMO_EDITION } from "./demo-data";
import { Edition } from "./types";

export async function getActiveEdition(): Promise<Edition> {
  const isDemo = process.env.DATA_SOURCE === "demo";

  if (isDemo) {
    return DEMO_EDITION;
  }

  // In database mode: query Prisma directly.
  // Connection errors are NOT swallowed or caught so they remain distinguishable.
  const edition = await prisma.edition.findFirst({
    where: { status: "ACTIVE" },
  });

  if (!edition) {
    throw new Error("Active edition not found in database.");
  }

  const themeSettings = (edition.themeSettings as Record<string, unknown>) ?? null;
  const countdownTarget = edition.countdownTarget
    ? edition.countdownTarget.toISOString()
    : ((themeSettings?.eventCountdownTarget as string) ?? null);

  return {
    id: edition.id,
    code: edition.code,
    name: edition.name,
    year: edition.year,
    status: edition.status as Edition["status"],
    startDate: edition.startDate ? edition.startDate.toISOString() : null,
    endDate: edition.endDate ? edition.endDate.toISOString() : null,
    countdownTarget,
    isDateConfirmed: edition.isDateConfirmed,
    themeSettings,
  };
}

export async function updateActiveEditionThemeSettings(
  newSettings: Record<string, unknown>
): Promise<Edition> {
  const isDemo = process.env.DATA_SOURCE === "demo";

  if (isDemo) {
    DEMO_EDITION.themeSettings = {
      ...(DEMO_EDITION.themeSettings || {}),
      ...newSettings,
    };
    return DEMO_EDITION;
  }

  const activeEdition = await prisma.edition.findFirst({
    where: { status: "ACTIVE" },
  });

  if (!activeEdition) {
    throw new Error("Active edition not found in database.");
  }

  const existingSettings = (activeEdition.themeSettings as Record<string, unknown>) ?? {};
  const mergedSettings = {
    ...existingSettings,
    ...newSettings,
  };

  const updated = await prisma.edition.update({
    where: { id: activeEdition.id },
    data: {
      themeSettings: mergedSettings as import("@/generated/prisma").Prisma.InputJsonValue,
    },
  });

  return {
    id: updated.id,
    code: updated.code,
    name: updated.name,
    year: updated.year,
    status: updated.status as Edition["status"],
    startDate: updated.startDate ? updated.startDate.toISOString() : null,
    endDate: updated.endDate ? updated.endDate.toISOString() : null,
    countdownTarget: updated.countdownTarget ? updated.countdownTarget.toISOString() : null,
    isDateConfirmed: updated.isDateConfirmed,
    themeSettings: mergedSettings,
  };
}

export async function updateActiveEditionDates(data: {
  startDate?: string | null;
  endDate?: string | null;
  isDateConfirmed?: boolean;
}): Promise<Edition> {
  const isDemo = process.env.DATA_SOURCE === "demo";

  if (isDemo) {
    if (data.startDate !== undefined) {
      DEMO_EDITION.startDate = data.startDate;
      DEMO_EDITION.countdownTarget = data.startDate;
    }
    if (data.endDate !== undefined) {
      DEMO_EDITION.endDate = data.endDate;
    }
    if (data.isDateConfirmed !== undefined) {
      DEMO_EDITION.isDateConfirmed = data.isDateConfirmed;
    }
    return DEMO_EDITION;
  }

  const activeEdition = await prisma.edition.findFirst({
    where: { status: "ACTIVE" },
  });

  if (!activeEdition) {
    throw new Error("Active edition not found in database.");
  }

  const updateData: {
    startDate?: Date | null;
    endDate?: Date | null;
    countdownTarget?: Date | null;
    isDateConfirmed?: boolean;
  } = {};

  if (data.startDate !== undefined) {
    updateData.startDate = data.startDate ? new Date(data.startDate) : null;
    updateData.countdownTarget = data.startDate ? new Date(data.startDate) : null;
  }
  if (data.endDate !== undefined) {
    updateData.endDate = data.endDate ? new Date(data.endDate) : null;
  }
  if (data.isDateConfirmed !== undefined) {
    updateData.isDateConfirmed = data.isDateConfirmed;
  }

  const updated = await prisma.edition.update({
    where: { id: activeEdition.id },
    data: updateData,
  });

  return {
    id: updated.id,
    code: updated.code,
    name: updated.name,
    year: updated.year,
    status: updated.status as Edition["status"],
    startDate: updated.startDate ? updated.startDate.toISOString() : null,
    endDate: updated.endDate ? updated.endDate.toISOString() : null,
    countdownTarget: updated.countdownTarget ? updated.countdownTarget.toISOString() : null,
    isDateConfirmed: updated.isDateConfirmed,
    themeSettings: (updated.themeSettings as Record<string, unknown>) ?? null,
  };
}