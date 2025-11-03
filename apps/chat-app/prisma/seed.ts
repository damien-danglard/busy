const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Create demo user
  // NOTE: This is a demo password for development only.
  // In production, users should create their own strong passwords.
  const demoPassword = 'BusyAdmin2024!';
  const hashedPassword = await bcrypt.hash(demoPassword, 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'admin@busy.com' },
    update: {},
    create: {
      email: 'admin@busy.com',
      name: 'Admin User',
      password: hashedPassword,
    },
  });

  console.log('Demo user created:', user);
  console.log('Login with: admin@busy.com / BusyAdmin2024!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
