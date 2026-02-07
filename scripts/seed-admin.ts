import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🌱 Seeding admin user and permissions...');

    const email = 'deepbimnet@gmail.com';
    const password = '123456789';
    const hashedPassword = await bcrypt.hash(password, 10);

    // Step 1: Create/Update admin user
    let adminUser;
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      adminUser = await prisma.user.update({
        where: { email },
        data: {
          password: hashedPassword,
          fullName: 'Admin User',
          phone: '0900000000',
        },
      });
      console.log('✅ Updated existing user to admin:', adminUser.email);
    } else {
      adminUser = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          fullName: 'Admin User',
          phone: '0900000000',
        },
      });
      console.log('✅ Created admin user:', adminUser.email);
    }

    // Step 2: Create permissions
    console.log('\n🔐 Creating permissions...');
    
    const viewUsersPermission = await prisma.permission.upsert({
      where: { name: 'view_users' },
      update: {},
      create: {
        name: 'view_users',
        description: 'Xem danh sách người dùng',
      },
    });
    console.log('✅ Permission created: view_users');

    const manageUsersPermission = await prisma.permission.upsert({
      where: { name: 'manage_users' },
      update: {},
      create: {
        name: 'manage_users',
        description: 'Quản lý quyền và vai trò người dùng',
      },
    });
    console.log('✅ Permission created: manage_users');

    // Step 3: Create admin role
    console.log('\n👑 Creating admin role...');
    
    const adminRole = await prisma.role.upsert({
      where: { name: 'admin' },
      update: {},
      create: {
        name: 'admin',
        description: 'Quản trị viên hệ thống',
      },
    });
    console.log('✅ Role created: admin');

    // Step 4: Assign permissions to admin role
    console.log('\n🔗 Assigning permissions to admin role...');
    
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: viewUsersPermission.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: viewUsersPermission.id,
      },
    });

    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: manageUsersPermission.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: manageUsersPermission.id,
      },
    });
    console.log('✅ Permissions assigned to admin role');

    // Step 5: Assign admin role to user
    console.log('\n👤 Assigning admin role to user...');
    
    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: adminUser.id,
          roleId: adminRole.id,
        },
      },
      update: {},
      create: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    });
    console.log('✅ Admin role assigned to user');

    console.log('\n✨ Setup completed successfully!');
    console.log('\n📝 Admin credentials:');
    console.log('   Email:', email);
    console.log('   Password:', password);
    console.log('   Role: admin');
    console.log('   Permissions: view_users, manage_users');
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Error seeding admin user:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
