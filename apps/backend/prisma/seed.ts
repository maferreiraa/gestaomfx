import { prisma } from '../src/config/database'
import { hashPassword } from '../src/modules/auth/password.util'

async function main() {
  console.log('🌱 Seeding database...')

  // Create default admin user
  const adminEmail = 'admin@gestaomfx.com'
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  })

  if (!existingAdmin) {
    const hashedPassword = await hashPassword('admin123456')
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'Administrador',
        passwordHash: hashedPassword,
      },
    })

    console.log(`✅ Created admin user: ${admin.email}`)

    // Create default watermark config
    await prisma.watermarkConfig.create({
      data: {
        userId: admin.id,
        text: 'mfxcreativee',
        opacity: 0.5,
        fontSize: 48,
        fontFamily: 'Arial',
        color: '#FFFFFF',
        repeatMode: 'diagonal',
        enabled: true,
      },
    })

    console.log('✅ Created default watermark config')

    // Create default PIX config
    await prisma.pixConfig.create({
      data: {
        userId: admin.id,
        key: 'your-pix-key-here',
        keyType: 'EMAIL',
        bankName: 'Seu Banco',
        bankCode: '001',
        accountHolder: 'MFX Creative',
      },
    })

    console.log('✅ Created default PIX config')

    // Create default price config
    await prisma.priceDefaults.create({
      data: {
        userId: admin.id,
        price1Photo: 25.0,
        price3Photos: 60.0,
        price10Photos: 150.0,
        pricePerExtra: 3.5,
      },
    })

    console.log('✅ Created default price config')
  } else {
    console.log('⏭️  Admin user already exists, skipping...')
  }

  console.log('✅ Seeding complete!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
