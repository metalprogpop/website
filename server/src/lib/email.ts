import { Resend } from "resend";

const getBaseUrl = (): string => {
  const baseUrl = process.env.MAGIC_LINK_BASE_URL;
  if (!baseUrl) {
    throw new Error("MAGIC_LINK_BASE_URL environment variable is required");
  }
  return baseUrl;
};

export const buildMagicLinkUrl = (token: string): string =>
  `${getBaseUrl()}/api/v1/auth/verify?token=${token}`;

export const sendMagicLinkEmail = async (
  email: string,
  token: string,
): Promise<void> => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn(
      "[email] RESEND_API_KEY not set — magic link email NOT sent. " +
        "Set DEV_SHOW_MAGIC_LINK=true to view the link in the UI instead.",
    );
    return;
  }
  const resend = new Resend(apiKey);
  const magicLink = buildMagicLinkUrl(token);

  const { error } = await resend.emails.send({
    from: "Metal Prog Pop <onboarding@resend.dev>",
    to: email,
    subject: "Tu link de acceso al Fan Clú",
    html: `
      <h2>Fan Clú — Metal Prog Pop</h2>
      <p>Hacé click en el siguiente link para acceder:</p>
      <p><a href="${magicLink}">Acceder al Fan Clú</a></p>
      <p>Este link expira en ${process.env.MAGIC_LINK_TOKEN_EXPIRATION_MINUTES ?? "10"} minutos.</p>
      <p>Si no solicitaste este acceso, ignorá este email.</p>
    `,
  });
  if (error) {
    throw new Error(`Resend rejected the magic link email: ${error.message}`);
  }
};
