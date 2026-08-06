import { Resend } from "resend";

const notificationEmail = process.env.CONTACT_NOTIFICATION_EMAIL;

function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

export async function sendContactNotification(data: {
  name: string;
  phone: string;
  email: string;
}) {
  const resend = getResend();
  if (!resend || !notificationEmail) return;

  await resend.emails.send({
    from: "Ladies Taylor <onboarding@resend.dev>",
    to: notificationEmail,
    subject: `New contact form submission from ${data.name}`,
    text: `Name: ${data.name}\nPhone: ${data.phone}\nEmail: ${data.email}`,
  });
}

export async function sendNewsletterNotification(data: {
  email: string;
  source: string;
}) {
  const resend = getResend();
  if (!resend || !notificationEmail) return;

  await resend.emails.send({
    from: "Ladies Taylor <onboarding@resend.dev>",
    to: notificationEmail,
    subject: `New newsletter signup: ${data.email}`,
    text: `Email: ${data.email}\nSource: ${data.source}`,
  });
}
