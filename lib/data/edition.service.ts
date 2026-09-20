import { prisma } from "@/lib/prisma";
import { DEMO_EDITION } from "./demo-data";
import { Edition, EditionFormData } from "./types";

let inMemoryEditions: Edition[] = [DEMO_EDITION];

function mapPrismaEditionToEdition(edition: {
  id: string;
  code: string;
  name: string;
  displayLabel?: string | null;
  startYear?: number | null;
  endYear?: number | null;
  year: number;
  status: string;
  startDate?: Date | null;
  endDate?: Date | null;
  countdownTarget?: Date | null;
  isDateConfirmed: boolean;
  themeSettings?: unknown;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}): Edition {
  const themeSettings = (edition.themeSettings as Record<string, unknown>) ?? null;
  const countdownTarget = edition.countdownTarget
    ? edition.countdownTarget.toISOString()
    : ((themeSettings?.eventCountdownTarget as string) ?? null);

  return {
    id: edition.id,
    code: edition.code,
    name: edition.name,
    displayLabel: edition.displayLabel ?? null,
    startYear: edition.startYear ?? null,
    endYear: edition.endYear ?? null,
    year: edition.year,
    status: edition.status as Edition["status"],
    startDate: edition.startDate ? edition.startDate.toISOString() : null,
    endDate: edition.endDate ? edition.endDate.toISOString() : null,
    countdownTarget,
    isDateConfirmed: Boolean(edition.isDateConfirmed),
    themeSettings,
    createdAt: edition.createdAt ? edition.createdAt.toISOString() : undefined,
    updatedAt: edition.updatedAt ? edition.updatedAt.toISOString() : undefined,
  };
}

export { formatEditionBranding } from "./edition-branding";

export async function getActiveEdition(): Promise<Edition> {
  const isDemo = process.env.DATA_SOURCE === "demo";

  if (isDemo) {
    const active = inMemoryEditions.find((e) => e.status === "ACTIVE") || inMemoryEditions[0] || DEMO_EDITION;
    return active;
  }

  // In database mode: query Prisma directly for ACTIVE edition
  const edition = await prisma.edition.findFirst({
    where: { status: "ACTIVE" },
  });

  if (!edition) {
    // Graceful fallback to any existing edition if none marked active
    const fallback = await prisma.edition.findFirst({
      orderBy: { createdAt: "desc" },
    });
    if (!fallback) {
      throw new Error("Active edition not found in database.");
    }
    return mapPrismaEditionToEdition(fallback);
  }

  return mapPrismaEditionToEdition(edition);
}

export async function getAllEditionsAdmin(): Promise<Edition[]> {
  const isDemo = process.env.DATA_SOURCE === "demo";

  if (isDemo) {
    return [...inMemoryEditions];
  }

  const editions = await prisma.edition.findMany({
    orderBy: [{ year: "desc" }, { createdAt: "desc" }],
  });

  return editions.map(mapPrismaEditionToEdition);
}

export async function createEdition(data: EditionFormData): Promise<Edition> {
  const isDemo = process.env.DATA_SOURCE === "demo";
  const name = data.name.trim();
  const displayLabel = data.displayLabel ? data.displayLabel.trim() : null;
  const startYear = data.startYear ?? data.endYear ?? new Date().getFullYear();
  const endYear = data.endYear ?? (data.startYear ? data.startYear + 1 : null);
  const year = data.startYear ?? new Date().getFullYear();
  const status = data.status || "DRAFT";

  // Generate safe unique code
  const codeBase = data.code?.trim() || `yatharth-${startYear}${endYear ? `-${endYear}` : ""}`.toLowerCase();
  let code = codeBase;

  if (isDemo) {
    if (status === "ACTIVE") {
      inMemoryEditions = inMemoryEditions.map((e) =>
        e.status === "ACTIVE" ? { ...e, status: "ARCHIVED" as const } : e
      );
    }
    const newEdition: Edition = {
      id: `edition-${Date.now()}`,
      code,
      name,
      displayLabel,
      startYear,
      endYear,
      year,
      status,
      startDate: data.startDate || null,
      endDate: data.endDate || null,
      countdownTarget: data.startDate || null,
      isDateConfirmed: Boolean(data.isDateConfirmed),
      themeSettings: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    inMemoryEditions.unshift(newEdition);
    return newEdition;
  }

  // Ensure code uniqueness in DB
  const existingCode = await prisma.edition.findUnique({ where: { code } });
  if (existingCode) {
    code = `${codeBase}-${Date.now().toString().slice(-4)}`;
  }

  if (status === "ACTIVE") {
    // In a transaction, archive ONLY the currently active edition, keeping others unchanged
    return prisma.$transaction(async (tx) => {
      await tx.edition.updateMany({
        where: { status: "ACTIVE" },
        data: { status: "ARCHIVED" },
      });
      const created = await tx.edition.create({
        data: {
          name,
          displayLabel,
          startYear,
          endYear,
          year,
          code,
          status: "ACTIVE",
          startDate: data.startDate ? new Date(data.startDate) : null,
          endDate: data.endDate ? new Date(data.endDate) : null,
          countdownTarget: data.startDate ? new Date(data.startDate) : null,
          isDateConfirmed: Boolean(data.isDateConfirmed),
          themeSettings: {},
        },
      });
      return mapPrismaEditionToEdition(created);
    });
  }

  const created = await prisma.edition.create({
    data: {
      name,
      displayLabel,
      startYear,
      endYear,
      year,
      code,
      status,
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
      countdownTarget: data.startDate ? new Date(data.startDate) : null,
      isDateConfirmed: Boolean(data.isDateConfirmed),
      themeSettings: {},
    },
  });

  return mapPrismaEditionToEdition(created);
}

export async function updateEdition(
  id: string,
  data: Partial<EditionFormData>
): Promise<Edition> {
  const isDemo = process.env.DATA_SOURCE === "demo";

  if (isDemo) {
    const idx = inMemoryEditions.findIndex((e) => e.id === id);
    if (idx === -1) throw new Error(`Edition ${id} not found.`);

    if (data.status === "ACTIVE") {
      inMemoryEditions = inMemoryEditions.map((e) =>
        e.status === "ACTIVE" && e.id !== id ? { ...e, status: "ARCHIVED" as const } : e
      );
    }

    inMemoryEditions[idx] = {
      ...inMemoryEditions[idx],
      name: data.name !== undefined ? data.name.trim() : inMemoryEditions[idx].name,
      displayLabel: data.displayLabel !== undefined ? (data.displayLabel ? data.displayLabel.trim() : null) : inMemoryEditions[idx].displayLabel,
      startYear: data.startYear !== undefined ? data.startYear : inMemoryEditions[idx].startYear,
      endYear: data.endYear !== undefined ? data.endYear : inMemoryEditions[idx].endYear,
      year: data.startYear !== undefined && data.startYear ? data.startYear : inMemoryEditions[idx].year,
      status: data.status || inMemoryEditions[idx].status,
      updatedAt: new Date().toISOString(),
    };
    return inMemoryEditions[idx];
  }

  if (data.status === "ACTIVE") {
    // In a transaction, archive ONLY the currently active edition, keeping others unchanged
    return prisma.$transaction(async (tx) => {
      await tx.edition.updateMany({
        where: { status: "ACTIVE", id: { not: id } },
        data: { status: "ARCHIVED" },
      });

      const updated = await tx.edition.update({
        where: { id },
        data: {
          ...(data.name ? { name: data.name.trim() } : {}),
          ...(data.displayLabel !== undefined ? { displayLabel: data.displayLabel ? data.displayLabel.trim() : null } : {}),
          ...(data.startYear !== undefined ? { startYear: data.startYear, year: data.startYear || undefined } : {}),
          ...(data.endYear !== undefined ? { endYear: data.endYear } : {}),
          status: "ACTIVE",
          ...(data.startDate !== undefined ? { startDate: data.startDate ? new Date(data.startDate) : null } : {}),
          ...(data.endDate !== undefined ? { endDate: data.endDate ? new Date(data.endDate) : null } : {}),
          ...(data.isDateConfirmed !== undefined ? { isDateConfirmed: data.isDateConfirmed } : {}),
        },
      });
      return mapPrismaEditionToEdition(updated);
    });
  }

  const updatePayload: {
    name?: string;
    displayLabel?: string | null;
    startYear?: number | null;
    endYear?: number | null;
    year?: number;
    status?: Edition["status"];
    startDate?: Date | null;
    endDate?: Date | null;
    isDateConfirmed?: boolean;
  } = {};

  if (data.name) updatePayload.name = data.name.trim();
  if (data.displayLabel !== undefined) updatePayload.displayLabel = data.displayLabel ? data.displayLabel.trim() : null;
  if (data.startYear !== undefined) {
    updatePayload.startYear = data.startYear;
    if (data.startYear) updatePayload.year = data.startYear;
  }
  if (data.endYear !== undefined) updatePayload.endYear = data.endYear;
  if (data.status) updatePayload.status = data.status;
  if (data.startDate !== undefined) updatePayload.startDate = data.startDate ? new Date(data.startDate) : null;
  if (data.endDate !== undefined) updatePayload.endDate = data.endDate ? new Date(data.endDate) : null;
  if (data.isDateConfirmed !== undefined) updatePayload.isDateConfirmed = data.isDateConfirmed;

  const updated = await prisma.edition.update({
    where: { id },
    data: updatePayload,
  });

  return mapPrismaEditionToEdition(updated);
}

export async function activateEdition(id: string): Promise<Edition> {
  const isDemo = process.env.DATA_SOURCE === "demo";

  if (isDemo) {
    inMemoryEditions = inMemoryEditions.map((e) => ({
      ...e,
      status: e.id === id ? ("ACTIVE" as const) : e.status === "ACTIVE" ? ("ARCHIVED" as const) : e.status,
    }));
    const active = inMemoryEditions.find((e) => e.id === id);
    if (!active) throw new Error(`Edition ${id} not found.`);
    return active;
  }

  return prisma.$transaction(async (tx) => {
    // Only archive the currently active edition
    await tx.edition.updateMany({
      where: { status: "ACTIVE", id: { not: id } },
      data: { status: "ARCHIVED" },
    });

    const activated = await tx.edition.update({
      where: { id },
      data: { status: "ACTIVE" },
    });

    return mapPrismaEditionToEdition(activated);
  });
}

export async function archiveEdition(id: string): Promise<Edition> {
  const isDemo = process.env.DATA_SOURCE === "demo";

  if (isDemo) {
    const target = inMemoryEditions.find((e) => e.id === id);
    if (!target) throw new Error(`Edition ${id} not found.`);
    if (target.status === "ACTIVE") {
      throw new Error("Cannot archive the currently active edition. Please activate a different edition first.");
    }
    target.status = "ARCHIVED";
    return target;
  }

  const target = await prisma.edition.findUnique({ where: { id } });
  if (!target) throw new Error(`Edition ${id} not found.`);
  if (target.status === "ACTIVE") {
    throw new Error("Cannot archive the currently active edition. Please activate a different edition first.");
  }

  const archived = await prisma.edition.update({
    where: { id },
    data: { status: "ARCHIVED" },
  });

  return mapPrismaEditionToEdition(archived);
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

  return mapPrismaEditionToEdition(updated);
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

  return mapPrismaEditionToEdition(updated);
}