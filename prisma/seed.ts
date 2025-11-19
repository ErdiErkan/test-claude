import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // 1. Create Admin User
  console.log('👤 Creating admin user...')
  const adminPassword = await bcrypt.hash('admin123', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@celebritybio.com' },
    update: {},
    create: {
      email: 'admin@celebritybio.com',
      passwordHash: adminPassword,
      fullName: 'Admin User',
      role: 'admin',
      isActive: true,
      emailVerifiedAt: new Date(),
    },
  })
  console.log('✅ Admin user created:', admin.email)

  // 2. Create Tags
  console.log('🏷️  Creating tags...')

  const tags = await Promise.all([
    prisma.tag.upsert({
      where: { slug: 'youtuber' },
      update: {},
      create: {
        slug: 'youtuber',
        nameTr: 'YouTuber',
        nameEn: 'YouTuber',
        category: 'profession',
        icon: '📺',
        color: '#FF0000',
      },
    }),
    prisma.tag.upsert({
      where: { slug: 'tiktok-star' },
      update: {},
      create: {
        slug: 'tiktok-star',
        nameTr: 'TikTok Fenomeni',
        nameEn: 'TikTok Star',
        category: 'profession',
        icon: '🎵',
        color: '#000000',
      },
    }),
    prisma.tag.upsert({
      where: { slug: 'chef' },
      update: {},
      create: {
        slug: 'chef',
        nameTr: 'Şef',
        nameEn: 'Chef',
        category: 'profession',
        icon: '👨‍🍳',
        color: '#FF6B6B',
      },
    }),
    prisma.tag.upsert({
      where: { slug: 'turkish' },
      update: {},
      create: {
        slug: 'turkish',
        nameTr: 'Türk',
        nameEn: 'Turkish',
        category: 'country',
        icon: '🇹🇷',
        color: '#E30A17',
      },
    }),
    prisma.tag.upsert({
      where: { slug: 'entrepreneur' },
      update: {},
      create: {
        slug: 'entrepreneur',
        nameTr: 'Girişimci',
        nameEn: 'Entrepreneur',
        category: 'profession',
        icon: '💼',
        color: '#4ECDC4',
      },
    }),
    prisma.tag.upsert({
      where: { slug: 'gaming' },
      update: {},
      create: {
        slug: 'gaming',
        nameTr: 'Oyun',
        nameEn: 'Gaming',
        category: 'genre',
        icon: '🎮',
        color: '#9B59B6',
      },
    }),
  ])
  console.log(`✅ Created ${tags.length} tags`)

  // 3. Create Sample Celebrities
  console.log('⭐ Creating sample celebrities...')

  // Celebrity 1: CZN Burak
  const burak = await prisma.celebrity.upsert({
    where: { slug: 'burak-ozdemir' },
    update: {},
    create: {
      slug: 'burak-ozdemir',
      firstName: 'Burak',
      lastName: 'Özdemir',
      fullName: 'Burak Özdemir',
      nickname: 'CZN Burak',
      birthDate: new Date('1994-03-15'),
      birthPlace: 'Hatay, Türkiye',
      country: 'Türkiye',
      profession: 'Chef, Entrepreneur, Social Media Influencer',
      activeYearsStart: 2016,
      profileImageUrl: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=800&h=800&fit=crop',
      isFeatured: true,
      isVerified: true,
      visibility: 'published',
      popularityScore: 95.5,
      totalViews: 125000,
      totalSearches: 45000,
    },
  })

  // Add translations for Burak
  await prisma.celebrityTranslation.upsert({
    where: {
      celebrityId_languageCode: {
        celebrityId: burak.id,
        languageCode: 'tr',
      },
    },
    update: {},
    create: {
      celebrityId: burak.id,
      languageCode: 'tr',
      bioShort: 'Dubai\'de restoran zinciri sahibi olan ve sosyal medyada 50+ milyon takipçisiyle ünlü Türk şef.',
      bioLong: `Burak Özdemir, 1994 yılında Hatay'da doğdu. "CZN Burak" takma adıyla tanınan Özdemir, Dubai'de açtığı Hatay Medeniyetler Sofrası restoranıyla dünya çapında ün kazandı.

Sosyal medyada paylaştığı dev porsiyonlu yemek videoları ve hiç konuşmadan sadece gülümseyerek yemek yapma tarzı ile viral oldu. Instagram'da 50+ milyon, TikTok'ta 30+ milyon takipçisi bulunmaktadır.

Birçok ünlü isim restoranını ziyaret etmiş ve Özdemir dünya genelinde çeşitli etkinliklerde yer almıştır.`,
      careerSummary: 'Dubai\'de restoran zinciri kurdu ve sosyal medyada dünya çapında ünlendi.',
      funFacts: JSON.stringify([
        'Videolarında hiç konuşmaz, sadece gülümser',
        '50+ ülkede şubesi bulunan restoran zinciri sahibi',
        'Instagram\'da 50 milyondan fazla takipçisi var',
        'Guinness Rekorlar Kitabı\'nda yer aldı',
        'NASA\'ya dev kebap gönderdi (viral olay)',
      ]),
      metaTitle: 'Burak Özdemir (CZN Burak) Kimdir? Biyografisi, Yaşı | Celebrity Bio',
      metaDescription: 'CZN Burak olarak tanınan Burak Özdemir\'in hayat hikayesi, sosyal medya başarısı ve ilginç bilgileri.',
    },
  })

  await prisma.celebrityTranslation.upsert({
    where: {
      celebrityId_languageCode: {
        celebrityId: burak.id,
        languageCode: 'en',
      },
    },
    update: {},
    create: {
      celebrityId: burak.id,
      languageCode: 'en',
      bioShort: 'Turkish chef and restaurateur known for his Dubai restaurant chain and 50+ million social media followers.',
      bioLong: `Burak Özdemir was born in Hatay, Turkey in 1994. Known as "CZN Burak", he gained worldwide fame with his Hatay Civilization Table restaurant in Dubai.

He went viral with his huge portion cooking videos on social media and his signature style of cooking while smiling without speaking. He has over 50 million followers on Instagram and 30+ million on TikTok.

Many celebrities have visited his restaurant and Özdemir has appeared in various events worldwide.`,
      careerSummary: 'Built a restaurant chain in Dubai and became globally famous on social media.',
      funFacts: JSON.stringify([
        'Never speaks in videos, only smiles',
        'Owns restaurant chain with branches in 50+ countries',
        'Has over 50 million followers on Instagram',
        'Featured in Guinness World Records',
        'Sent giant kebab to NASA (viral moment)',
      ]),
      metaTitle: 'Burak Özdemir (CZN Burak) - Biography, Age | Celebrity Bio',
      metaDescription: 'Life story, social media success and interesting facts about Burak Özdemir, known as CZN Burak.',
    },
  })

  // Add social links for Burak
  await prisma.socialLink.createMany({
    data: [
      {
        celebrityId: burak.id,
        platform: 'instagram',
        handle: 'cznburak',
        url: 'https://instagram.com/cznburak',
        followersCount: 54200000,
        isVerified: true,
        sortOrder: 1,
      },
      {
        celebrityId: burak.id,
        platform: 'tiktok',
        handle: 'cznburak',
        url: 'https://tiktok.com/@cznburak',
        followersCount: 32100000,
        isVerified: true,
        sortOrder: 2,
      },
      {
        celebrityId: burak.id,
        platform: 'youtube',
        handle: 'CZN Burak',
        url: 'https://youtube.com/@cznburak',
        followersCount: 12500000,
        isVerified: true,
        sortOrder: 3,
      },
    ],
    skipDuplicates: true,
  })

  // Add tags to Burak
  await prisma.celebrityTag.createMany({
    data: [
      { celebrityId: burak.id, tagId: tags[0].id }, // youtuber
      { celebrityId: burak.id, tagId: tags[2].id }, // chef
      { celebrityId: burak.id, tagId: tags[3].id }, // turkish
      { celebrityId: burak.id, tagId: tags[4].id }, // entrepreneur
    ],
    skipDuplicates: true,
  })

  console.log('✅ Created celebrity: CZN Burak')

  // Celebrity 2: Enes Batur
  const enes = await prisma.celebrity.upsert({
    where: { slug: 'enes-batur' },
    update: {},
    create: {
      slug: 'enes-batur',
      firstName: 'Enes',
      lastName: 'Batur',
      fullName: 'Enes Batur',
      birthDate: new Date('1998-04-09'),
      birthPlace: 'İstanbul, Türkiye',
      country: 'Türkiye',
      profession: 'YouTuber, Content Creator, Actor',
      activeYearsStart: 2012,
      profileImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=800&fit=crop',
      isVerified: true,
      visibility: 'published',
      popularityScore: 88.3,
      totalViews: 98000,
      totalSearches: 35000,
    },
  })

  await prisma.celebrityTranslation.upsert({
    where: {
      celebrityId_languageCode: {
        celebrityId: enes.id,
        languageCode: 'tr',
      },
    },
    update: {},
    create: {
      celebrityId: enes.id,
      languageCode: 'tr',
      bioShort: 'Türkiye\'nin en ünlü YouTuberlarından biri. Oyun videoları ve vlog içerikleriyle milyonlarca takipçiye ulaştı.',
      bioLong: `Enes Batur, 1998 yılında İstanbul'da doğdu. 2012 yılında YouTube'a video yüklemeye başladı ve kısa sürede Türkiye'nin en popüler YouTuberlarından biri haline geldi.

Minecraft videoları ile başladığı kariyerinde daha sonra vlog, challenge ve çeşitli içerik türlerine yöneldi. YouTube'da 16+ milyon abonesi bulunmaktadır.

Ayrıca "Enes Batur: Hayal mi Gerçek mi?" adlı filmi ile sinema dünyasına da adım attı.`,
      funFacts: JSON.stringify([
        'İlk YouTube videosunu 2012\'de yayınladı',
        '16+ milyon YouTube abonesi var',
        'Kendi adını taşıyan bir filmi var',
        'Türkiye\'nin en çok kazanan YouTuberlarından',
      ]),
    },
  })

  await prisma.socialLink.createMany({
    data: [
      {
        celebrityId: enes.id,
        platform: 'youtube',
        handle: 'Enes Batur',
        url: 'https://youtube.com/@enesbatur',
        followersCount: 16000000,
        isVerified: true,
        sortOrder: 1,
      },
      {
        celebrityId: enes.id,
        platform: 'instagram',
        handle: 'enesbatur',
        url: 'https://instagram.com/enesbatur',
        followersCount: 8500000,
        isVerified: true,
        sortOrder: 2,
      },
    ],
    skipDuplicates: true,
  })

  await prisma.celebrityTag.createMany({
    data: [
      { celebrityId: enes.id, tagId: tags[0].id }, // youtuber
      { celebrityId: enes.id, tagId: tags[3].id }, // turkish
      { celebrityId: enes.id, tagId: tags[5].id }, // gaming
    ],
    skipDuplicates: true,
  })

  console.log('✅ Created celebrity: Enes Batur')

  // 4. Create Sample News
  console.log('📰 Creating sample news...')

  const news1 = await prisma.newsItem.create({
    data: {
      slug: 'czn-burak-new-york-restaurant',
      primaryCelebrityId: burak.id,
      featuredImageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&h=630&fit=crop',
      category: 'project',
      visibility: 'published',
      publishedAt: new Date(),
    },
  })

  await prisma.newsTranslation.create({
    data: {
      newsId: news1.id,
      languageCode: 'tr',
      title: 'CZN Burak New York\'ta Yeni Restoran Açıyor',
      summary: 'Ünlü şef CZN Burak, restoran zincirini genişleterek New York Manhattan\'da yeni bir şube açacağını duyurdu.',
      content: 'Dubai\'de büyük başarı yakalayan CZN Burak, Amerika\'da da restoran açma kararı aldı. Manhattan\'da açılacak yeni restoran, Türk mutfağını Amerika\'ya tanıtmayı hedefliyor.',
    },
  })

  await prisma.newsCelebrity.create({
    data: {
      newsId: news1.id,
      celebrityId: burak.id,
    },
  })

  console.log('✅ Created sample news')

  // 5. Create Popularity Stats
  console.log('📊 Creating popularity stats...')

  const today = new Date()
  const weekAgo = new Date(today)
  weekAgo.setDate(weekAgo.getDate() - 7)

  await prisma.popularityStat.create({
    data: {
      celebrityId: burak.id,
      periodType: 'weekly',
      periodStart: weekAgo,
      periodEnd: today,
      viewCount: 125000,
      searchCount: 45000,
      popularityScore: 95.5,
      rankPosition: 1,
    },
  })

  await prisma.popularityStat.create({
    data: {
      celebrityId: enes.id,
      periodType: 'weekly',
      periodStart: weekAgo,
      periodEnd: today,
      viewCount: 98000,
      searchCount: 35000,
      popularityScore: 88.3,
      rankPosition: 2,
    },
  })

  console.log('✅ Created popularity stats')

  console.log('\n🎉 Database seeding completed successfully!')
  console.log('\n📊 Summary:')
  console.log('   - 1 admin user')
  console.log('   - 6 tags')
  console.log('   - 2 celebrities (CZN Burak, Enes Batur)')
  console.log('   - 5 social links')
  console.log('   - 1 news item')
  console.log('   - 2 popularity stats')
  console.log('\n✅ You can now login with:')
  console.log('   Email: admin@celebritybio.com')
  console.log('   Password: admin123')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error during seeding:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
