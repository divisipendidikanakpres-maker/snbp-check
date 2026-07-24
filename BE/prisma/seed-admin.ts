import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminFullName = process.env.ADMIN_FULLNAME;
  const adminPhone = process.env.ADMIN_PHONE;

  if (!adminEmail || !adminPassword || !adminFullName || !adminPhone) {
    console.error(
      'Error: Set ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_FULLNAME, ADMIN_PHONE env vars'
    );
    process.exit(1);
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const user = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: 'ADMIN' },
    create: {
      fullName: adminFullName,
      phone: adminPhone,
      email: adminEmail,
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log(`Admin user ${user.email} created/updated successfully`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
