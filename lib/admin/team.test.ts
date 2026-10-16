import { describe, expect, it, vi, beforeEach } from "vitest";

const mockCreateUser = vi.fn();
const mockListUsers = vi.fn();
const mockUpdateUserById = vi.fn();
const mockDeleteUser = vi.fn();
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    auth: {
      admin: {
        createUser: mockCreateUser,
        listUsers: mockListUsers,
        updateUserById: mockUpdateUserById,
        deleteUser: mockDeleteUser,
      },
    },
  }),
}));

const mockUpsert = vi.fn();
const mockFindMany = vi.fn();
const mockFindUnique = vi.fn();
const mockUpdate = vi.fn();
const mockDeleteMany = vi.fn();
vi.mock("@/lib/db", () => ({
  db: {
    adminProfile: {
      upsert: (...args: unknown[]) => mockUpsert(...args),
      findMany: (...args: unknown[]) => mockFindMany(...args),
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
      update: (...args: unknown[]) => mockUpdate(...args),
      deleteMany: (...args: unknown[]) => mockDeleteMany(...args),
    },
  },
}));

import { reactivateTeamMember, removeTeamMember, suspendTeamMember, upsertTeamMember } from "./team";

describe("suspend / reactivate / remove a team member", () => {
  beforeEach(() => {
    for (const m of [mockUpdateUserById, mockDeleteUser, mockUpdate, mockDeleteMany]) m.mockReset();
    mockUpdateUserById.mockResolvedValue({ data: {}, error: null });
    mockDeleteUser.mockResolvedValue({ data: {}, error: null });
    mockUpdate.mockResolvedValue({});
    mockDeleteMany.mockResolvedValue({ count: 1 });
  });

  it("suspends by flagging the profile and banning the Supabase account", async () => {
    await suspendTeamMember("hostess-1", "admin-1");

    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: "hostess-1" },
      data: { suspendedAt: expect.any(Date) },
    });
    expect(mockUpdateUserById).toHaveBeenCalledWith("hostess-1", { ban_duration: "876000h" });
  });

  // Le drapeau en base suffit à couper l'accès : un ban Supabase en échec ne
  // doit pas faire croire à l'admin que la suspension a raté.
  it("keeps the suspension when the Supabase ban fails", async () => {
    mockUpdateUserById.mockResolvedValue({ data: {}, error: { message: "boom" } });

    await expect(suspendTeamMember("hostess-1", "admin-1")).resolves.toBeUndefined();
    expect(mockUpdate).toHaveBeenCalled();
  });

  it("reactivates by lifting the ban before clearing the flag", async () => {
    await reactivateTeamMember("hostess-1", "admin-1");

    expect(mockUpdateUserById).toHaveBeenCalledWith("hostess-1", { ban_duration: "none" });
    expect(mockUpdate).toHaveBeenCalledWith({ where: { id: "hostess-1" }, data: { suspendedAt: null } });
  });

  it("leaves the account suspended when lifting the ban fails", async () => {
    mockUpdateUserById.mockResolvedValue({ data: {}, error: { message: "boom" } });

    await expect(reactivateTeamMember("hostess-1", "admin-1")).rejects.toMatchObject({ message: "boom" });
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("removes the login account and the profile", async () => {
    await removeTeamMember("hostess-1", "admin-1");

    expect(mockDeleteUser).toHaveBeenCalledWith("hostess-1");
    expect(mockDeleteMany).toHaveBeenCalledWith({ where: { id: "hostess-1" } });
  });

  it("finishes a half-done removal when the Supabase account is already gone", async () => {
    mockDeleteUser.mockResolvedValue({ data: {}, error: { status: 404, code: "user_not_found", message: "User not found" } });

    await removeTeamMember("hostess-1", "admin-1");
    expect(mockDeleteMany).toHaveBeenCalledWith({ where: { id: "hostess-1" } });
  });

  it("keeps the profile when deleting the Supabase account fails for another reason", async () => {
    mockDeleteUser.mockResolvedValue({ data: {}, error: { status: 500, message: "boom" } });

    await expect(removeTeamMember("hostess-1", "admin-1")).rejects.toMatchObject({ message: "boom" });
    expect(mockDeleteMany).not.toHaveBeenCalled();
  });

  it("refuses to suspend, reactivate or remove the admin's own account", async () => {
    await expect(suspendTeamMember("admin-1", "admin-1")).rejects.toThrow("propre accès");
    await expect(reactivateTeamMember("admin-1", "admin-1")).rejects.toThrow("propre accès");
    await expect(removeTeamMember("admin-1", "admin-1")).rejects.toThrow("propre accès");
    expect(mockUpdate).not.toHaveBeenCalled();
    expect(mockDeleteUser).not.toHaveBeenCalled();
  });
});

describe("upsertTeamMember", () => {
  beforeEach(() => {
    mockCreateUser.mockReset();
    mockListUsers.mockReset();
    mockUpsert.mockReset();
    mockFindUnique.mockReset();
    mockFindUnique.mockResolvedValue(null);
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

  it("never demotes an existing admin to scanner", async () => {
    mockCreateUser.mockResolvedValue({
      data: { user: null },
      error: { code: "email_exists", message: "already registered" },
    });
    mockListUsers.mockResolvedValue({ data: { users: [{ id: "boss", email: "boss@example.com" }] }, error: null });
    mockFindUnique.mockResolvedValue({ id: "boss", role: "admin" });

    const result = await upsertTeamMember({ fullName: "Boss", email: "boss@example.com", password: "x12345", role: "scanner" });

    expect(result).toEqual({ status: "unchanged", id: "boss" });
    expect(mockUpsert).not.toHaveBeenCalled();
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
