import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { magicLinkResponseSchema } from "shared";
import { API_URL } from "../lib/api";
import { isDevShowMagicLink } from "../lib/devFlags";

// Requests a magic link. Test users are logged in at once, and in dev the
// link can come back in the response instead of by email.
export const useMagicLinkLogin = () => {
  const queryClient = useQueryClient();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [magicLink, setMagicLink] = useState<string | null>(null);

  const submitEmail = async (email: string): Promise<void> => {
    setSubmitting(true);
    setSubmitError(false);
    setMagicLink(null);

    try {
      const res = await fetch(`${API_URL}/api/v1/auth/magic-link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
        credentials: "include",
      });
      if (!res.ok) {
        setSubmitError(true);
        return;
      }
      const body = magicLinkResponseSchema.parse(await res.json());
      if (body.authenticated === true) {
        await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
        return;
      }
      if (isDevShowMagicLink() && body.magicLink !== undefined) {
        setMagicLink(body.magicLink);
      }
      setSubmitted(true);
    } catch {
      setSubmitError(true);
    } finally {
      setSubmitting(false);
    }
  };

  return { submitEmail, submitted, submitting, submitError, magicLink };
};
