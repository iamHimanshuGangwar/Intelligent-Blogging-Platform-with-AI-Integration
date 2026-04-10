import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD || process.env.SMTP_PASS,
  },
});

export async function sendWelcomeEmail(to: string, name?: string) {
  const displayName = name || 'there';

  await transporter.sendMail({
    from: process.env.SMTP_FROM || `AiBlog <${process.env.SMTP_USER}>`,
    to,
    subject: 'Welcome to AiBlog Newsletter!',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px; color: #e0e0e0; background: #121212;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="font-size: 28px; font-weight: 800; color: #ffffff; margin: 0;">AiBlog</h1>
          <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 3px; color: #888; margin-top: 4px;">Editorial Intelligence</p>
        </div>
        <h2 style="font-size: 22px; color: #ffffff; margin-bottom: 16px;">Hey ${displayName} 👋</h2>
        <p style="font-size: 15px; line-height: 1.7; color: #b0b0b0;">
          Welcome to the AiBlog newsletter! You're now part of a community of creators, engineers, and thought leaders shaping the future of AI-powered content.
        </p>
        <p style="font-size: 15px; line-height: 1.7; color: #b0b0b0;">Here's what you'll get:</p>
        <ul style="font-size: 14px; line-height: 2; color: #b0b0b0; padding-left: 20px;">
          <li>Weekly curated AI & editorial insights</li>
          <li>Career growth tips for content creators</li>
          <li>Early access to new platform features</li>
        </ul>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3004'}/community"
             style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #6366f1, #818cf8); color: #fff; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 14px;">
            Explore the Community
          </a>
        </div>
        <hr style="border: none; border-top: 1px solid #333; margin: 32px 0;" />
        <p style="font-size: 12px; color: #666; text-align: center;">
          You're receiving this because you subscribed at AiBlog. <br />
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3004'}" style="color: #6366f1;">Unsubscribe</a>
        </p>
      </div>
    `,
  });
}

export async function sendCollaborationInviteEmail(input: {
  to: string;
  inviteeName?: string;
  inviterName: string;
  postTitle: string;
  editorLink: string;
}) {
  const { to, inviteeName, inviterName, postTitle, editorLink } = input;
  const displayName = inviteeName || 'there';

  await transporter.sendMail({
    from: process.env.SMTP_FROM || `AiBlog <${process.env.SMTP_USER}>`,
    to,
    subject: `Collaboration invite for "${postTitle}"`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 580px; margin: 0 auto; padding: 32px 20px; color: #d4d4d8; background: #09090b;">
        <h1 style="font-size: 24px; margin: 0 0 8px; color: #fafafa;">AiBlog Collaboration Invite</h1>
        <p style="margin: 0 0 20px; color: #a1a1aa; font-size: 13px; letter-spacing: 0.08em; text-transform: uppercase;">Work together on a draft</p>

        <p style="font-size: 15px; line-height: 1.7; margin: 0 0 12px; color: #e4e4e7;">Hi ${displayName},</p>
        <p style="font-size: 15px; line-height: 1.7; margin: 0 0 12px; color: #d4d4d8;">
          <strong style="color:#fafafa;">${inviterName}</strong> invited you to collaborate on:
        </p>
        <p style="font-size: 18px; font-weight: 700; margin: 0 0 24px; color: #fafafa;">${postTitle}</p>

        <a href="${editorLink}" style="display:inline-block; padding: 12px 20px; background:#2563eb; color:#ffffff; text-decoration:none; font-weight:700; border-radius:10px;">
          Open Collaboration Invite
        </a>

        <p style="font-size: 13px; line-height: 1.6; margin-top: 24px; color: #a1a1aa;">
          If you did not expect this invite, you can safely ignore this email.
        </p>
      </div>
    `,
  });
}

export { transporter };

export async function sendPublishAnnouncementEmail(input: {
  to: string;
  subscriberName?: string;
  postTitle: string;
  postExcerpt?: string;
  postSlug: string;
  coverImageUrl?: string;
  authorName: string;
}) {
  const { to, subscriberName, postTitle, postExcerpt, postSlug, coverImageUrl, authorName } = input;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://aiblog.dev';
  const postUrl = `${appUrl}/blog/${postSlug}`;
  const displayName = subscriberName || 'Reader';

  await transporter.sendMail({
    from: process.env.SMTP_FROM || `AiBlog <${process.env.SMTP_USER}>`,
    to,
    subject: `New post: ${postTitle}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px; color: #e0e0e0; background: #121212;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="font-size: 28px; font-weight: 800; color: #ffffff; margin: 0;">AiBlog</h1>
          <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 3px; color: #888; margin-top: 4px;">New Article</p>
        </div>
        <p style="font-size: 15px; line-height: 1.7; color: #b0b0b0;">Hi ${displayName},</p>
        ${coverImageUrl ? `<img src="${coverImageUrl}" alt="${postTitle}" style="width:100%;border-radius:12px;margin-bottom:24px;" />` : ''}
        <h2 style="font-size: 22px; font-weight: 700; color: #ffffff; margin: 0 0 12px;">${postTitle}</h2>
        <p style="font-size: 13px; color: #888; margin: 0 0 16px;">By ${authorName}</p>
        ${postExcerpt ? `<p style="font-size: 15px; line-height: 1.7; color: #b0b0b0; margin-bottom: 24px;">${postExcerpt}</p>` : ''}
        <div style="text-align: center; margin: 32px 0;">
          <a href="${postUrl}" style="display: inline-block; padding: 14px 32px; background: #ffffff; color: #000000; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 14px;">
            Read Article →
          </a>
        </div>
        <hr style="border: none; border-top: 1px solid #333; margin: 32px 0;" />
        <p style="font-size: 12px; color: #666; text-align: center;">
          You're receiving this because you subscribed to AiBlog updates.<br />
          <a href="${appUrl}" style="color: #aaa;">Unsubscribe</a>
        </p>
      </div>
    `,
  });
}
