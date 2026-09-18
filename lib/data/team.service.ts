import { prisma } from "@/lib/prisma";
import { DEMO_TEAM, DEMO_TEAMS, DEMO_PEOPLE } from "./demo-data";
import { TeamMember, FestivalTeam, TeamType, Person } from "./types";

export async function getFestivalTeams(): Promise<FestivalTeam[]> {
  const isDemo = process.env.DATA_SOURCE === "demo";

  if (isDemo) {
    return DEMO_TEAMS.map((team) => ({
      ...team,
      members: DEMO_TEAM.filter((m) => m.teamId === team.id),
    }));
  }

  const teams = await prisma.festivalTeam.findMany({
    where: { isPublished: true },
    orderBy: { displayOrder: "asc" },
    include: {
      members: {
        where: { isPublished: true },
        orderBy: { displayOrder: "asc" },
        include: {
          person: true,
        },
      },
    },
  });

  return teams.map((t) => ({
    id: t.id,
    editionId: t.editionId,
    name: t.name,
    teamType: t.teamType as TeamType,
    displayOrder: t.displayOrder,
    isPublished: t.isPublished,
    members: t.members.map((m) => ({
      id: m.id,
      editionId: m.editionId,
      personId: m.personId,
      teamId: m.teamId,
      designation: m.designation,
      displayOrder: m.displayOrder,
      isPublished: m.isPublished,
      person: {
        id: m.person.id,
        name: m.person.name,
        email: m.person.email,
        phone: m.person.phone,
        avatarUrl: m.person.avatarUrl,
        bio: m.person.bio,
        socialLinks: m.person.socialLinks as Record<string, string> | null,
      },
      name: m.person.name,
      teamGroup: t.name,
      photoUrl: m.person.avatarUrl,
      bio: m.person.bio,
      socialLinks: m.person.socialLinks as Record<string, string> | null,
      order: m.displayOrder,
    })),
  }));
}

export async function getTeamMembers(): Promise<TeamMember[]> {
  const isDemo = process.env.DATA_SOURCE === "demo";

  if (isDemo) {
    return DEMO_TEAM;
  }

  const members = await prisma.teamMember.findMany({
    where: { isPublished: true },
    orderBy: { displayOrder: "asc" },
    include: {
      person: true,
      team: true,
    },
  });

  return members.map((m) => ({
    id: m.id,
    editionId: m.editionId,
    personId: m.personId,
    teamId: m.teamId,
    designation: m.designation,
    displayOrder: m.displayOrder,
    isPublished: m.isPublished,
    person: {
      id: m.person.id,
      name: m.person.name,
      email: m.person.email,
      phone: m.person.phone,
      avatarUrl: m.person.avatarUrl,
      bio: m.person.bio,
      socialLinks: m.person.socialLinks as Record<string, string> | null,
    },
    team: {
      id: m.team.id,
      editionId: m.team.editionId,
      name: m.team.name,
      teamType: m.team.teamType as TeamType,
      displayOrder: m.team.displayOrder,
      isPublished: m.team.isPublished,
    },
    name: m.person.name,
    teamGroup: m.team.name,
    photoUrl: m.person.avatarUrl,
    bio: m.person.bio,
    socialLinks: m.person.socialLinks as Record<string, string> | null,
    order: m.displayOrder,
  }));
}

export async function getAllFestivalTeamsAdmin(): Promise<FestivalTeam[]> {
  const isDemo = process.env.DATA_SOURCE === "demo";

  if (isDemo) {
    return DEMO_TEAMS.map((team) => ({
      ...team,
      members: DEMO_TEAM.filter((m) => m.teamId === team.id).sort(
        (a, b) => a.displayOrder - b.displayOrder
      ),
    }));
  }

  const teams = await prisma.festivalTeam.findMany({
    orderBy: { displayOrder: "asc" },
    include: {
      members: {
        orderBy: { displayOrder: "asc" },
        include: {
          person: true,
        },
      },
    },
  });

  return teams.map((t) => ({
    id: t.id,
    editionId: t.editionId,
    name: t.name,
    teamType: t.teamType as TeamType,
    displayOrder: t.displayOrder,
    isPublished: t.isPublished,
    members: t.members.map((m) => ({
      id: m.id,
      editionId: m.editionId,
      personId: m.personId,
      teamId: m.teamId,
      designation: m.designation,
      displayOrder: m.displayOrder,
      isPublished: m.isPublished,
      person: {
        id: m.person.id,
        name: m.person.name,
        email: m.person.email,
        phone: m.person.phone,
        avatarUrl: m.person.avatarUrl,
        bio: m.person.bio,
        socialLinks: m.person.socialLinks as Record<string, string> | null,
      },
      name: m.person.name,
      teamGroup: t.name,
      photoUrl: m.person.avatarUrl,
      bio: m.person.bio,
      socialLinks: m.person.socialLinks as Record<string, string> | null,
      order: m.displayOrder,
    })),
  }));
}

export async function createFestivalTeam(data: {
  name: string;
  teamType?: TeamType;
  displayOrder?: number;
  isPublished?: boolean;
}): Promise<FestivalTeam> {
  const isDemo = process.env.DATA_SOURCE === "demo";

  if (isDemo) {
    const newTeam: FestivalTeam = {
      id: `team-${Date.now()}`,
      editionId: "edition-yatharth-26",
      name: data.name,
      teamType: data.teamType || "ORGANIZER",
      displayOrder: data.displayOrder ?? DEMO_TEAMS.length + 1,
      isPublished: data.isPublished !== undefined ? data.isPublished : true,
      members: [],
    };
    DEMO_TEAMS.push(newTeam);
    return newTeam;
  }

  const activeEdition = await prisma.edition.findFirst({
    where: { status: "ACTIVE" },
  });
  if (!activeEdition) throw new Error("Active edition not found");

  const created = await prisma.festivalTeam.create({
    data: {
      editionId: activeEdition.id,
      name: data.name,
      teamType: (data.teamType || "ORGANIZER") as import("@/generated/prisma").TeamType,
      displayOrder: data.displayOrder ?? 0,
      isPublished: data.isPublished !== undefined ? data.isPublished : true,
    },
    include: { members: { include: { person: true } } },
  });

  return {
    id: created.id,
    editionId: created.editionId,
    name: created.name,
    teamType: created.teamType as TeamType,
    displayOrder: created.displayOrder,
    isPublished: created.isPublished,
    members: [],
  };
}

export async function updateFestivalTeam(
  id: string,
  data: Partial<FestivalTeam>
): Promise<FestivalTeam> {
  const isDemo = process.env.DATA_SOURCE === "demo";

  if (isDemo) {
    const found = DEMO_TEAMS.find((t) => t.id === id);
    if (!found) throw new Error(`Team not found: ${id}`);
    if (data.name) found.name = data.name;
    if (data.teamType) found.teamType = data.teamType;
    if (data.displayOrder !== undefined) found.displayOrder = data.displayOrder;
    if (data.isPublished !== undefined) found.isPublished = data.isPublished;
    return found;
  }

  const updated = await prisma.festivalTeam.update({
    where: { id },
    data: {
      ...(data.name ? { name: data.name } : {}),
      ...(data.teamType ? { teamType: data.teamType as import("@/generated/prisma").TeamType } : {}),
      ...(data.displayOrder !== undefined ? { displayOrder: data.displayOrder } : {}),
      ...(data.isPublished !== undefined ? { isPublished: data.isPublished } : {}),
    },
  });

  return {
    id: updated.id,
    editionId: updated.editionId,
    name: updated.name,
    teamType: updated.teamType as TeamType,
    displayOrder: updated.displayOrder,
    isPublished: updated.isPublished,
  };
}

export async function deleteFestivalTeam(id: string): Promise<boolean> {
  const isDemo = process.env.DATA_SOURCE === "demo";

  if (isDemo) {
    const idx = DEMO_TEAMS.findIndex((t) => t.id === id);
    if (idx !== -1) {
      DEMO_TEAMS.splice(idx, 1);
      return true;
    }
    return false;
  }

  await prisma.festivalTeam.delete({ where: { id } });
  return true;
}

export async function createTeamMember(data: {
  teamId: string;
  name: string;
  designation: string;
  email?: string | null;
  phone?: string | null;
  bio?: string | null;
  displayOrder?: number;
  isPublished?: boolean;
}): Promise<TeamMember> {
  const isDemo = process.env.DATA_SOURCE === "demo";

  if (isDemo) {
    const team = DEMO_TEAMS.find((t) => t.id === data.teamId);
    let person = DEMO_PEOPLE.find(
      (p: Person) => p.name.toLowerCase() === data.name.toLowerCase()
    );
    if (!person) {
      person = {
        id: `person-${Date.now()}`,
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        avatarUrl: null,
        bio: data.bio || null,
        socialLinks: data.email ? { email: data.email } : null,
      };
      DEMO_PEOPLE.push(person);
    }

    const newMember: TeamMember = {
      id: `member-${Date.now()}`,
      editionId: "edition-yatharth-26",
      personId: person.id,
      teamId: data.teamId,
      designation: data.designation,
      displayOrder: data.displayOrder ?? DEMO_TEAM.length + 1,
      isPublished: data.isPublished !== undefined ? data.isPublished : true,
      person,
      name: person.name,
      teamGroup: team?.name || "Team",
      photoUrl: person.avatarUrl,
      bio: data.bio || person.bio,
      socialLinks: person.socialLinks as Record<string, string> | null,
      order: data.displayOrder ?? DEMO_TEAM.length + 1,
    };
    DEMO_TEAM.push(newMember);
    return newMember;
  }

  const activeEdition = await prisma.edition.findFirst({ where: { status: "ACTIVE" } });
  if (!activeEdition) throw new Error("Active edition not found");

  let person = await prisma.person.findFirst({
    where: { name: { equals: data.name, mode: "insensitive" } },
  });

  if (!person) {
    person = await prisma.person.create({
      data: {
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        bio: data.bio || null,
      },
    });
  }

  const member = await prisma.teamMember.create({
    data: {
      editionId: activeEdition.id,
      personId: person.id,
      teamId: data.teamId,
      designation: data.designation,
      displayOrder: data.displayOrder ?? 0,
      isPublished: data.isPublished !== undefined ? data.isPublished : true,
    },
    include: {
      person: true,
      team: true,
    },
  });

  return {
    id: member.id,
    editionId: member.editionId,
    personId: member.personId,
    teamId: member.teamId,
    designation: member.designation,
    displayOrder: member.displayOrder,
    isPublished: member.isPublished,
    person: {
      id: member.person.id,
      name: member.person.name,
      email: member.person.email,
      phone: member.person.phone,
      avatarUrl: member.person.avatarUrl,
      bio: member.person.bio,
      socialLinks: member.person.socialLinks as Record<string, string> | null,
    },
    team: {
      id: member.team.id,
      editionId: member.team.editionId,
      name: member.team.name,
      teamType: member.team.teamType as TeamType,
      displayOrder: member.team.displayOrder,
      isPublished: member.team.isPublished,
    },
    name: member.person.name,
    teamGroup: member.team.name,
    photoUrl: member.person.avatarUrl,
    bio: member.person.bio,
    socialLinks: member.person.socialLinks as Record<string, string> | null,
    order: member.displayOrder,
  };
}

export async function updateTeamMember(
  id: string,
  data: {
    name?: string;
    designation?: string;
    email?: string | null;
    phone?: string | null;
    bio?: string | null;
    displayOrder?: number;
    isPublished?: boolean;
    teamId?: string;
  }
): Promise<TeamMember> {
  const isDemo = process.env.DATA_SOURCE === "demo";

  if (isDemo) {
    const found = DEMO_TEAM.find((m) => m.id === id);
    if (!found) throw new Error(`Team member not found: ${id}`);
    if (data.designation) found.designation = data.designation;
    if (data.displayOrder !== undefined) found.displayOrder = data.displayOrder;
    if (data.isPublished !== undefined) found.isPublished = data.isPublished;
    if (data.teamId) found.teamId = data.teamId;

    if (found.person) {
      if (data.name) {
        found.person.name = data.name;
        found.name = data.name;
      }
      if (data.email !== undefined) found.person.email = data.email;
      if (data.phone !== undefined) found.person.phone = data.phone;
      if (data.bio !== undefined) found.person.bio = data.bio;
    }
    return found;
  }

  const member = await prisma.teamMember.findUnique({
    where: { id },
    include: { person: true },
  });
  if (!member) throw new Error(`Team member not found: ${id}`);

  if (data.name || data.email !== undefined || data.phone !== undefined || data.bio !== undefined) {
    await prisma.person.update({
      where: { id: member.personId },
      data: {
        ...(data.name ? { name: data.name } : {}),
        ...(data.email !== undefined ? { email: data.email } : {}),
        ...(data.phone !== undefined ? { phone: data.phone } : {}),
        ...(data.bio !== undefined ? { bio: data.bio } : {}),
      },
    });
  }

  const updated = await prisma.teamMember.update({
    where: { id },
    data: {
      ...(data.designation ? { designation: data.designation } : {}),
      ...(data.displayOrder !== undefined ? { displayOrder: data.displayOrder } : {}),
      ...(data.isPublished !== undefined ? { isPublished: data.isPublished } : {}),
      ...(data.teamId ? { teamId: data.teamId } : {}),
    },
    include: {
      person: true,
      team: true,
    },
  });

  return {
    id: updated.id,
    editionId: updated.editionId,
    personId: updated.personId,
    teamId: updated.teamId,
    designation: updated.designation,
    displayOrder: updated.displayOrder,
    isPublished: updated.isPublished,
    person: {
      id: updated.person.id,
      name: updated.person.name,
      email: updated.person.email,
      phone: updated.person.phone,
      avatarUrl: updated.person.avatarUrl,
      bio: updated.person.bio,
      socialLinks: updated.person.socialLinks as Record<string, string> | null,
    },
    team: {
      id: updated.team.id,
      editionId: updated.team.editionId,
      name: updated.team.name,
      teamType: updated.team.teamType as TeamType,
      displayOrder: updated.team.displayOrder,
      isPublished: updated.team.isPublished,
    },
    name: updated.person.name,
    teamGroup: updated.team.name,
    photoUrl: updated.person.avatarUrl,
    bio: updated.person.bio,
    socialLinks: updated.person.socialLinks as Record<string, string> | null,
    order: updated.displayOrder,
  };
}

export async function deleteTeamMember(id: string): Promise<boolean> {
  const isDemo = process.env.DATA_SOURCE === "demo";

  if (isDemo) {
    const idx = DEMO_TEAM.findIndex((m) => m.id === id);
    if (idx !== -1) {
      DEMO_TEAM.splice(idx, 1);
      return true;
    }
    return false;
  }

  await prisma.teamMember.delete({ where: { id } });
  return true;
}