import { Resend } from "resend";

const getResend = (): Resend => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY environment variable is required");
  }
  return new Resend(apiKey);
};

const getBaseUrl = (): string => {
  const baseUrl = process.env.MAGIC_LINK_BASE_URL;
  if (!baseUrl) {
    throw new Error("MAGIC_LINK_BASE_URL environment variable is required");
  }
  return baseUrl;
};

export const sendMagicLinkEmail = async (
  email: string,
  token: string,
): Promise<void> => {
  const resend = getResend();
  const baseUrl = getBaseUrl();
  const magicLink = `${baseUrl}/api/v1/auth/verify?token=${token}`;

  await resend.emails.send({
    from: "Metal Prog Pop <noreply@metalprogpop.com>",
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
};
