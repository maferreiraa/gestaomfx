import { prisma } from '../src/config/database'
import { hashPassword } from '../src/modules/auth/password.util'

async function main() {
  console.log('🌱 Seeding database...')

  // Create default admin user
  const adminEmail = 'maferreiraa@hotmail.com'
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  })

  if (!existingAdmin) {
    const hashedPassword = await hashPassword('m32364023')
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'MFX Creative',
        passwordHash: hashedPassword,
      },
    })

    console.log(`✅ Created admin user: ${admin.email}`)

    // Create default watermark config
    await prisma.watermarkConfig.create({
      data: {
        userId: admin.id,
        text: 'mfxcreativee',
        opacity: 0.25,
        fontSize: 60,
        fontFamily: 'Arial',
        color: '#FFFFFF',
        repeatMode: 'diagonal',
        enabled: true,
      },
    })

    console.log('✅ Created watermark config (10% size, 25% opacity)')

    // Create default PIX config
    await prisma.pixConfig.create({
      data: {
        userId: admin.id,
        key: 'mfxcreativee@gmail.com',
        keyType: 'EMAIL',
        bankName: 'Mercado Pago',
        bankCode: 'MP',
        accountHolder: 'Marina Ferreira Andrade',
      },
    })

    console.log('✅ Created PIX config (Marina Ferreira Andrade)')

    // Create default price config
    await prisma.priceDefaults.create({
      data: {
        userId: admin.id,
        price1Photo: 14.90,
        price3Photos: 24.90,
        price10Photos: 35.00,
        pricePerExtra: 3.50,
      },
    })

    console.log('✅ Created price config (1: R$14,90 | 3: R$24,90 | 10: R$35,00 | Extra: R$3,50)')
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
