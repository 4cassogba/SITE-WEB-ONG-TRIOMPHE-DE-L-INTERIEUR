import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockSignIn = vi.fn();
const mockPush = vi.fn();
const mockRefresh = vi.fn();

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({ auth: { signInWithPassword: mockSignIn } }),
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}));

import LoginForm from "./LoginForm";

describe("LoginForm", () => {
  beforeEach(() => {
    mockSignIn.mockReset();
    mockPush.mockReset();
    mockRefresh.mockReset();
  });

  // Avant le chargement du JS, le HTML serveur ne doit jamais permettre un
  // envoi natif en GET (identifiants en clair dans l'URL).
  it("server-renders a disabled POST form until hydration", async () => {
    const { renderToString } = await import("react-dom/server");
    const html = renderToString(<LoginForm />);

    expect(html).toMatch(/<form[^>]*method="post"/);
    expect(html).toMatch(/<button[^>]*type="submit"[^>]*disabled=""/);
  });

  it("shows a suspended-account message when Supabase reports a ban", async () => {
    mockSignIn.mockResolvedValue({ error: { code: "user_banned", message: "User is banned" } });
    render(<LoginForm />);

    await userEvent.type(screen.getByLabelText(/email/i), "hotesse@example.com");
    await userEvent.type(screen.getByLabelText(/mot de passe/i), "scan12345");
    fireEvent.click(screen.getByRole("button", { name: /se connecter/i }));

    expect(await screen.findByText(/compte est suspendu/i)).toBeInTheDocument();
  });

  it("shows an error message when sign-in fails", async () => {
    mockSignIn.mockResolvedValue({ error: { message: "Invalid login credentials" } });
    render(<LoginForm />);

    await userEvent.type(screen.getByLabelText(/email/i), "test@example.com");
    await userEvent.type(screen.getByLabelText(/mot de passe/i), "wrongpassword");
    fireEvent.click(screen.getByRole("button", { name: /se connecter/i }));

    expect(await screen.findByText(/identifiants incorrects/i)).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("redirects to /admin on successful sign-in", async () => {
    mockSignIn.mockResolvedValue({ error: null });
    render(<LoginForm />);

    await userEvent.type(screen.getByLabelText(/email/i), "test@example.com");
    await userEvent.type(screen.getByLabelText(/mot de passe/i), "correctpassword");
    fireEvent.click(screen.getByRole("button", { name: /se connecter/i }));

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/admin"));
    expect(mockRefresh).toHaveBeenCalled();
  });
});
