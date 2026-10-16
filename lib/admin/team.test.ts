import { describe, expect, it, vi, beforeEach } from "vitest";

const mockCreateUser = vi.fn();
const mockListUsers = vi.fn();
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    auth: { admin: { createUser: mockCreateUser, listUsers: mockListUsers } },
  }),
}));

const mockUpsert = vi.fn();
const mockFindMany = vi.fn();
vi.mock("@/lib/db", () => ({
  db: { adminProfile: { upsert: (...args: unknown[]) => mockUpsert(...args), findMany: (...args: unknown[]) => mockFindMany(...args) } },
}));

import { upsertTeamMember } from "./team";

describe("upsertTeamMember", () => {
  beforeEach(() => {
    mockCreateUser.mockReset();
    mockListUsers.mockReset();
    mockUpsert.mockReset();
  });

  it("creates a new Supabase Auth user and AdminProfile row when the email is new", async () => {
    mockCreateUser.mockResolvedValue({ data: { user: { id: "user-1" } }, error: null });
    mockUpsert.mockResolvedValue({});

    const result = await upsertTeamMember({
      fullName: "Awa Hôtesse",
      email: "awa@example.com",
      password: "soiree2026",
      role: "scanner",
    });

    expect(result).toEqual({ status: "created", id: "user-1" });
    expect(mockUpsert).toHaveBeenCalledWith({
      where: { id: "user-1" },
      create: { id: "user-1", fullName: "Awa Hôtesse", role: "scanner" },
      update: { fullName: "Awa Hôtesse", role: "scanner" },
    });
    expect(mockListUsers).not.toHaveBeenCalled();
  });

  // Le cas "s'ils sont déjà dans la base" : quelqu'un a déjà un compte
  // Supabase Auth pour cet email (créé plus tôt pour une autre raison) —
  // on attribue le rôle à ce compte existant plutôt que d'échouer, et on ne
  // touche jamais à son mot de passe.
  it("attributes the role to an existing auth account instead of failing when the email is already registered", async () => {
    mockCreateUser.mockResolvedValue({
      data: { user: null },
      error: { code: "email_exists", message: "A user with this email address has already been registered" },
    });
    mockListUsers.mockResolvedValue({
      data: { users: [{ id: "existing-user", email: "deja@example.com" }] },
      error: null,
    });
    mockUpsert.mockResolvedValue({});

    const result = await upsertTeamMember({
      fullName: "Fatou Déjà-Là",
      email: "deja@example.com",
      password: "ignored-for-existing-account",
      role: "scanner",
    });

    expect(result).toEqual({ status: "attributed", id: "existing-user" });
    expect(mockUpsert).toHaveBeenCalledWith({
      where: { id: "existing-user" },
      create: { id: "existing-user", fullName: "Fatou Déjà-Là", role: "scanner" },
      update: { fullName: "Fatou Déjà-Là", role: "scanner" },
    });
  });

  it("rethrows an unrelated createUser error instead of attempting attribution", async () => {
    mockCreateUser.mockResolvedValue({
      data: { user: null },
      error: { code: "weak_password", message: "Password should be at least 6 characters" },
    });

    await expect(
      upsertTeamMember({ fullName: "Test", email: "test@example.com", password: "a", role: "scanner" })
    ).rejects.toMatchObject({ code: "weak_password" });
    expect(mockUpsert).not.toHaveBeenCalled();
    expect(mockListUsers).not.toHaveBeenCalled();
  });
});
