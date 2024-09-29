const { PrismaClient } = require('@prisma/client');

const argon = require('argon2');

const prisma = new PrismaClient();

async function setup() {
  try {
    await prisma.$transaction(async (_prisma) => {
      await _prisma.role.create({
        data: {
          name: 'USER',
        },
      });

      const admin = await _prisma.role.create({
        data: {
          name: 'ADMIN',
        },
      });

      const adminEmail = process.env.ADMIN_EMAIL;
      const adminPhoneNumber = process.env.ADMIN_PHONE_NUMBER;
      const adminPassword = process.env.ADMIN_PASSWORD;
      const adminImageUrl = process.env.ADMIN_IMAGE_URL;

      if (
        !adminEmail ||
        !adminPhoneNumber ||
        !adminPassword ||
        !adminImageUrl
      ) {
        throw new Error('Missing admin information');
      }

      // save user
      await _prisma.user.create({
        data: {
          firstName: 'Guds',
          lastName: 'Admin',
          address: 'Just for Admin',
          dateOfBirth: new Date(),
          email: adminEmail,
          phoneNumber: adminPhoneNumber,
          gender: 'MALE',
          image: adminImageUrl,
        },
      });

      const hashedPass = await argon.hash(adminPassword);

      // save account
      const user = await _prisma.account.create({
        data: {
          userPhoneNumber: adminPhoneNumber,
          password: hashedPass,
          status: 'ACTIVE',
          roleId: admin.id,
        },
      });
    });
  } catch (error) {
    throw error;
  }
}

setup()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
