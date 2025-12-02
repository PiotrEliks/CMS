import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendNewUserCredentialsMail(options: { to: string; password: string }) {
  await transporter.sendMail({
    from: process.env.MAIL_FROM ?? '"CMS" <no-reply@twoja-domena.pl>',
    to: options.to,
    subject: 'Dane do logowania do systemu',
    text: `
Witaj!

Zostało dla Ciebie utworzone konto w systemie CMS.
Login (e-mail): ${options.to}
Hasło: ${options.password}

Zalecamy zmianę hasła po pierwszym zalogowaniu.
`,
    html: `
      <p>Witaj!</p>
      <p>Zostało dla Ciebie utworzone konto w systemie CMS.</p>
      <p>
        <strong>Login (e-mail):</strong> ${options.to}<br/>
        <strong>Hasło:</strong> ${options.password}
      </p>
      <p>Zalecamy zmianę hasła po pierwszym zalogowaniu.</p>
    `,
  });
}
