/**
 * Verify Admin User Script
 * Checks if admin user exists and password is correctly hashed
 */

import prisma from '../src/lib/prisma'
import bcrypt from 'bcryptjs'

async function main() {
  console.log('🔍 Checking admin user...\n')

  const admin = await prisma.user.findUnique({
    where: { email: 'admin@school.local' }
  })

  if (!admin) {
    console.log('❌ Admin user not found!')
    console.log('Run: pnpm tsx prisma/seed.ts')
    return
  }

  console.log('✅ Admin user found!')
  console.log('📧 Email:', admin.email)
  console.log('👤 Name:', admin.name)
  console.log('🔑 Role:', admin.role)
  console.log('🔒 Password Hash:', admin.password?.substring(0, 30) + '...')
  console.log('✉️  Email Verified:', admin.emailVerified)

  // Test password verification
  if (admin.password) {
    console.log('\n🧪 Testing password verification...')
    const isValid = await bcrypt.compare('admin123', admin.password)

    if (isValid) {
      console.log('✅ Password verification successful!')
      console.log('\n📝 Login Credentials:')
      console.log('   Email: admin@school.local')
      console.log('   Password: admin123')
      console.log('\n🌐 Test at: http://localhost:3000/signin')
    } else {
      console.log('❌ Password verification failed!')
    }
  }
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
