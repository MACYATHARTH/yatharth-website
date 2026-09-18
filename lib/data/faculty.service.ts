import { prisma } from "@/lib/prisma";
import { DEMO_FACULTY } from "./demo-data";
import { FacultyData, FacultyMember, FacultyRole } from "./types";

interface PrismaFacultyRow {
  id: string;
  editionId?: string | null;
  name: string;
  designation: string;
  photoUrl?: string | null;
  role: string;
  displayOrder: number;
  isPublished: boolean;
  email?: string | null;
  department?: string | null;
  institution?: string | null;
  bio?: string | null;
}

function formatFacultyMember(m: PrismaFacultyRow): FacultyMember {
  return {
    id: m.id,
    editionId: m.editionId || undefined,
    name: m.name,
    designation: m.designation,
    photoUrl: m.photoUrl,
    role: m.role as FacultyRole,
    displayOrder: m.displayOrder,
    isPublished: m.isPublished,
    email: m.email,
    department: m.department,
    institution: m.institution,
    bio: m.bio,
  };
}

export async function getFacultyData(): Promise<FacultyData> {
  const isDemo = process.env.DATA_SOURCE === "demo";

  if (isDemo) {
    const published = DEMO_FACULTY.filter((f) => f.isPublished);
    const principal = published.find((f) => f.role === "PRINCIPAL") || null;
    const hod = published.find((f) => f.role === "HOD") || null;
    const facultyMembers = published
      .filter((f) => f.role !== "PRINCIPAL" && f.id !== hod?.id)
      .sort((a, b) => a.displayOrder - b.displayOrder);

    return {
      principal,
      hod,
      facultyMembers,
    };
  }

  try {
    const members = await prisma.facultyMember.findMany({
      where: { isPublished: true },
      orderBy: { displayOrder: "asc" },
    });

    const principal = members.find((f) => f.role === "PRINCIPAL") || null;
    const hod = members.find((f) => f.role === "HOD") || null;
    const facultyMembers = members
      .filter((f) => f.role !== "PRINCIPAL" && f.id !== hod?.id)
      .sort((a, b) => a.displayOrder - b.displayOrder);

    return {
      principal: principal ? formatFacultyMember(principal) : null,
      hod: hod ? formatFacultyMember(hod) : null,
      facultyMembers: facultyMembers.map(formatFacultyMember),
    };
  } catch {
    // Fallback to demo data on database connection failure
    const published = DEMO_FACULTY.filter((f) => f.isPublished);
    const principal = published.find((f) => f.role === "PRINCIPAL") || null;
    const hod = published.find((f) => f.role === "HOD") || null;
    const facultyMembers = published
      .filter((f) => f.role !== "PRINCIPAL" && f.id !== hod?.id)
      .sort((a, b) => a.displayOrder - b.displayOrder);

    return {
      principal,
      hod,
      facultyMembers,
    };
  }
}

export async function getAllFacultyMembersAdmin(): Promise<FacultyMember[]> {
  const isDemo = process.env.DATA_SOURCE === "demo";

  if (isDemo) {
    return [...DEMO_FACULTY].sort((a, b) => a.displayOrder - b.displayOrder);
  }

  try {
    const members = await prisma.facultyMember.findMany({
      orderBy: { displayOrder: "asc" },
    });
    return members.map(formatFacultyMember);
  } catch {
    return [...DEMO_FACULTY].sort((a, b) => a.displayOrder - b.displayOrder);
  }
}

export async function createFacultyMember(data: {
  name: string;
  designation: string;
  role?: FacultyRole;
  photoUrl?: string | null;
  displayOrder?: number;
  isPublished?: boolean;
  email?: string | null;
  department?: string | null;
  institution?: string | null;
  bio?: string | null;
}): Promise<FacultyMember> {
  const isDemo = process.env.DATA_SOURCE === "demo";

  if (isDemo) {
    const newMember: FacultyMember = {
      id: `faculty-${Date.now()}`,
      editionId: "edition-yatharth-26",
      name: data.name,
      designation: data.designation,
      photoUrl: data.photoUrl || null,
      role: data.role || "FACULTY",
      displayOrder: data.displayOrder ?? (DEMO_FACULTY.length + 1),
      isPublished: data.isPublished !== undefined ? data.isPublished : true,
      email: data.email || null,
      department: data.department || null,
      institution: data.institution || null,
      bio: data.bio || null,
    };
    DEMO_FACULTY.push(newMember);
    return newMember;
  }

  const activeEdition = await prisma.edition.findFirst({
    where: { status: "ACTIVE" },
  });
  const editionId = activeEdition?.id || "edition-yatharth-26";

  const created = await prisma.facultyMember.create({
    data: {
      editionId,
      name: data.name,
      designation: data.designation,
      photoUrl: data.photoUrl || null,
      role: (data.role || "FACULTY") as import("@/generated/prisma").FacultyRole,
      displayOrder: data.displayOrder ?? 0,
      isPublished: data.isPublished !== undefined ? data.isPublished : true,
      email: data.email || null,
      department: data.department || null,
      institution: data.institution || null,
      bio: data.bio || null,
    },
  });

  return formatFacultyMember(created);
}

export async function updateFacultyMember(
  id: string,
  data: Partial<FacultyMember>
): Promise<FacultyMember> {
  const isDemo = process.env.DATA_SOURCE === "demo";

  if (isDemo) {
    const found = DEMO_FACULTY.find((f) => f.id === id);
    if (!found) throw new Error(`Faculty member not found: ${id}`);
    if (data.name !== undefined) found.name = data.name;
    if (data.designation !== undefined) found.designation = data.designation;
    if (data.photoUrl !== undefined) found.photoUrl = data.photoUrl;
    if (data.role !== undefined) found.role = data.role;
    if (data.displayOrder !== undefined) found.displayOrder = data.displayOrder;
    if (data.isPublished !== undefined) found.isPublished = data.isPublished;
    if (data.email !== undefined) found.email = data.email;
    if (data.department !== undefined) found.department = data.department;
    if (data.institution !== undefined) found.institution = data.institution;
    if (data.bio !== undefined) found.bio = data.bio;
    return { ...found };
  }

  const updated = await prisma.facultyMember.update({
    where: { id },
    data: {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.designation !== undefined ? { designation: data.designation } : {}),
      ...(data.photoUrl !== undefined ? { photoUrl: data.photoUrl } : {}),
      ...(data.role !== undefined ? { role: data.role as import("@/generated/prisma").FacultyRole } : {}),
      ...(data.displayOrder !== undefined ? { displayOrder: data.displayOrder } : {}),
      ...(data.isPublished !== undefined ? { isPublished: data.isPublished } : {}),
      ...(data.email !== undefined ? { email: data.email } : {}),
      ...(data.department !== undefined ? { department: data.department } : {}),
      ...(data.institution !== undefined ? { institution: data.institution } : {}),
      ...(data.bio !== undefined ? { bio: data.bio } : {}),
    },
  });

  return formatFacultyMember(updated);
}

export async function deleteFacultyMember(id: string): Promise<boolean> {
  const isDemo = process.env.DATA_SOURCE === "demo";

  if (isDemo) {
    const idx = DEMO_FACULTY.findIndex((f) => f.id === id);
    if (idx !== -1) {
      DEMO_FACULTY.splice(idx, 1);
      return true;
    }
    return false;
  }

  await prisma.facultyMember.delete({ where: { id } });
  return true;
}
