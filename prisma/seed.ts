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
    prisma.tag.upsert({
      where: { slug: 'musician' },
      update: {},
      create: {
        slug: 'musician',
        nameTr: 'Müzisyen',
        nameEn: 'Musician',
        category: 'profession',
        icon: '🎤',
        color: '#E74C3C',
      },
    }),
    prisma.tag.upsert({
      where: { slug: 'rapper' },
      update: {},
      create: {
        slug: 'rapper',
        nameTr: 'Rapçi',
        nameEn: 'Rapper',
        category: 'profession',
        icon: '🎵',
        color: '#2C3E50',
      },
    }),
    prisma.tag.upsert({
      where: { slug: 'influencer' },
      update: {},
      create: {
        slug: 'influencer',
        nameTr: 'Influencer',
        nameEn: 'Influencer',
        category: 'profession',
        icon: '✨',
        color: '#F39C12',
      },
    }),
    prisma.tag.upsert({
      where: { slug: 'model' },
      update: {},
      create: {
        slug: 'model',
        nameTr: 'Model',
        nameEn: 'Model',
        category: 'profession',
        icon: '👗',
        color: '#E91E63',
      },
    }),
    prisma.tag.upsert({
      where: { slug: 'actor' },
      update: {},
      create: {
        slug: 'actor',
        nameTr: 'Oyuncu',
        nameEn: 'Actor',
        category: 'profession',
        icon: '🎬',
        color: '#8E44AD',
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

  // Celebrity 3: Nusret Gökçe (Salt Bae)
  const nusret = await prisma.celebrity.upsert({
    where: { slug: 'nusret-gokce' },
    update: {},
    create: {
      slug: 'nusret-gokce',
      firstName: 'Nusret',
      lastName: 'Gökçe',
      fullName: 'Nusret Gökçe',
      nickname: 'Salt Bae',
      birthDate: new Date('1983-08-09'),
      birthPlace: 'Erzurum, Türkiye',
      country: 'Türkiye',
      profession: 'Chef, Restaurateur, Social Media Influencer',
      activeYearsStart: 2010,
      profileImageUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&h=800&fit=crop',
      isFeatured: true,
      isVerified: true,
      visibility: 'published',
      popularityScore: 92.8,
      totalViews: 110000,
      totalSearches: 42000,
    },
  })

  await prisma.celebrityTranslation.upsert({
    where: {
      celebrityId_languageCode: {
        celebrityId: nusret.id,
        languageCode: 'tr',
      },
    },
    update: {},
    create: {
      celebrityId: nusret.id,
      languageCode: 'tr',
      bioShort: 'Viral "tuz serpme" hareketiyle dünya çapında ünlenen Türk şef ve restoran zinciri sahibi.',
      bioLong: `Nusret Gökçe, 1983 yılında Erzurum'da doğdu. "Salt Bae" takma adıyla tanınan Gökçe, 2017 yılında sosyal medyada paylaşılan tuz serpme hareketiyle viral oldu ve dünya çapında ün kazandı.

İstanbul'da başlayan restoran zinciri Nusr-Et, bugün Dubai, Miami, New York, Londra ve daha birçok şehirde şubeler açtı. Lüks steakhouse konseptiyle bilinen restoranlarda birçok ünlü ismi ağırladı.

Sosyal medyada 50+ milyon takipçisi bulunan Gökçe, özellikle Instagram'daki gösterişli et kesme ve servis videolarıyla tanınır.`,
      careerSummary: 'Dünya çapında 20+ şubesi olan lüks restoran zinciri kurdu.',
      funFacts: JSON.stringify([
        'Viral "tuz serpme" hareketi ile dünyaca ünlü oldu',
        'Dünya genelinde 20+ Nusr-Et restoranı var',
        'Lionel Messi, David Beckham gibi ünlüleri ağırladı',
        '24 karat altın kaplı steak servisi yapıyor',
        'İlk işi kasaplıktı, şimdi milyoner',
      ]),
      metaTitle: 'Nusret Gökçe (Salt Bae) Kimdir? Biyografisi | Celebrity Bio',
      metaDescription: 'Salt Bae olarak tanınan Nusret Gökçe\'nin hayat hikayesi, restoran zinciri ve viral olma süreci.',
    },
  })

  await prisma.celebrityTranslation.upsert({
    where: {
      celebrityId_languageCode: {
        celebrityId: nusret.id,
        languageCode: 'en',
      },
    },
    update: {},
    create: {
      celebrityId: nusret.id,
      languageCode: 'en',
      bioShort: 'Turkish chef and restaurateur who became globally famous with his viral "salt sprinkling" gesture.',
      bioLong: `Nusret Gökçe was born in Erzurum, Turkey in 1983. Known as "Salt Bae", he went viral in 2017 with a video of his unique salt-sprinkling gesture and gained worldwide fame.

His restaurant chain Nusr-Et, which started in Istanbul, now has branches in Dubai, Miami, New York, London and many other cities. Known for its luxury steakhouse concept, his restaurants have hosted many celebrities.

With over 50 million followers on social media, Gökçe is especially known for his theatrical meat cutting and serving videos on Instagram.`,
      careerSummary: 'Built a luxury restaurant chain with 20+ branches worldwide.',
      funFacts: JSON.stringify([
        'Became world-famous with viral "salt sprinkling" gesture',
        'Has 20+ Nusr-Et restaurants worldwide',
        'Hosted celebrities like Lionel Messi and David Beckham',
        'Serves 24-karat gold-plated steaks',
        'Started as a butcher, now a millionaire',
      ]),
      metaTitle: 'Nusret Gökçe (Salt Bae) - Biography | Celebrity Bio',
      metaDescription: 'Life story of Nusret Gökçe, known as Salt Bae, his restaurant chain and viral success.',
    },
  })

  await prisma.socialLink.createMany({
    data: [
      {
        celebrityId: nusret.id,
        platform: 'instagram',
        handle: 'nusr_et',
        url: 'https://instagram.com/nusr_et',
        followersCount: 51000000,
        isVerified: true,
        sortOrder: 1,
      },
      {
        celebrityId: nusret.id,
        platform: 'twitter',
        handle: 'nusr_ett',
        url: 'https://twitter.com/nusr_ett',
        followersCount: 520000,
        isVerified: true,
        sortOrder: 2,
      },
    ],
    skipDuplicates: true,
  })

  await prisma.celebrityTag.createMany({
    data: [
      { celebrityId: nusret.id, tagId: tags[2].id }, // chef
      { celebrityId: nusret.id, tagId: tags[3].id }, // turkish
      { celebrityId: nusret.id, tagId: tags[4].id }, // entrepreneur
      { celebrityId: nusret.id, tagId: tags[8].id }, // influencer
    ],
    skipDuplicates: true,
  })

  console.log('✅ Created celebrity: Nusret Gökçe (Salt Bae)')

  // Celebrity 4: Reynmen (Yusuf Aktaş)
  const reynmen = await prisma.celebrity.upsert({
    where: { slug: 'reynmen' },
    update: {},
    create: {
      slug: 'reynmen',
      firstName: 'Yusuf',
      lastName: 'Aktaş',
      fullName: 'Yusuf Aktaş',
      nickname: 'Reynmen',
      birthDate: new Date('1995-12-19'),
      birthPlace: 'Antalya, Türkiye',
      country: 'Türkiye',
      profession: 'Rapper, YouTuber, Content Creator',
      activeYearsStart: 2015,
      profileImageUrl: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=800&h=800&fit=crop',
      isVerified: true,
      visibility: 'published',
      popularityScore: 85.6,
      totalViews: 87000,
      totalSearches: 31000,
    },
  })

  await prisma.celebrityTranslation.upsert({
    where: {
      celebrityId_languageCode: {
        celebrityId: reynmen.id,
        languageCode: 'tr',
      },
    },
    update: {},
    create: {
      celebrityId: reynmen.id,
      languageCode: 'tr',
      bioShort: 'YouTube\'da başlayan kariyerine rap müzik ile devam eden genç sanatçı.',
      bioLong: `Yusuf Aktaş, 1995 yılında Antalya'da doğdu. "Reynmen" takma adıyla 2015 yılında YouTube'da içerik üretmeye başladı ve kısa sürede milyonlarca takipçiye ulaştı.

2017 yılında müzik kariyerine başlayan Reynmen, "Ela", "Leila" gibi şarkılarıyla listelerde zirveye çıktı. Şarkıları YouTube'da yüz milyonlarca izlenme aldı.

Hem YouTube kanalında vlog ve eğlence içerikleri üretmeye devam ediyor hem de müzik kariyerini sürdürüyor.`,
      careerSummary: 'YouTuber olarak başladı, rap müzikle devam etti.',
      funFacts: JSON.stringify([
        'İlk viral videosu 2015\'te yayınlandı',
        '"Ela" şarkısı 500+ milyon izlenme aldı',
        'YouTube\'da 5+ milyon abonesi var',
        'İlk single\'ı listelerde birinci oldu',
      ]),
      metaTitle: 'Reynmen (Yusuf Aktaş) Kimdir? Biyografisi | Celebrity Bio',
      metaDescription: 'Reynmen olarak tanınan Yusuf Aktaş\'ın hayat hikayesi, YouTube ve müzik kariyeri.',
    },
  })

  await prisma.socialLink.createMany({
    data: [
      {
        celebrityId: reynmen.id,
        platform: 'youtube',
        handle: 'Reynmen',
        url: 'https://youtube.com/@reynmen',
        followersCount: 5200000,
        isVerified: true,
        sortOrder: 1,
      },
      {
        celebrityId: reynmen.id,
        platform: 'instagram',
        handle: 'reynmen',
        url: 'https://instagram.com/reynmen',
        followersCount: 4800000,
        isVerified: true,
        sortOrder: 2,
      },
    ],
    skipDuplicates: true,
  })

  await prisma.celebrityTag.createMany({
    data: [
      { celebrityId: reynmen.id, tagId: tags[0].id }, // youtuber
      { celebrityId: reynmen.id, tagId: tags[3].id }, // turkish
      { celebrityId: reynmen.id, tagId: tags[6].id }, // musician
      { celebrityId: reynmen.id, tagId: tags[7].id }, // rapper
    ],
    skipDuplicates: true,
  })

  console.log('✅ Created celebrity: Reynmen')

  // Celebrity 5: Danla Bilic
  const danla = await prisma.celebrity.upsert({
    where: { slug: 'danla-bilic' },
    update: {},
    create: {
      slug: 'danla-bilic',
      firstName: 'Danla',
      lastName: 'Bilic',
      fullName: 'Danla Bilic',
      birthDate: new Date('1994-10-06'),
      birthPlace: 'İstanbul, Türkiye',
      country: 'Türkiye',
      profession: 'Social Media Influencer, Entrepreneur, Model',
      activeYearsStart: 2014,
      profileImageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&h=800&fit=crop',
      isVerified: true,
      visibility: 'published',
      popularityScore: 83.2,
      totalViews: 79000,
      totalSearches: 28000,
    },
  })

  await prisma.celebrityTranslation.upsert({
    where: {
      celebrityId_languageCode: {
        celebrityId: danla.id,
        languageCode: 'tr',
      },
    },
    update: {},
    create: {
      celebrityId: danla.id,
      languageCode: 'tr',
      bioShort: 'Türkiye\'nin en ünlü sosyal medya fenomenlerinden biri, girişimci ve model.',
      bioLong: `Danla Bilic, 1994 yılında İstanbul'da doğdu. Sosyal medyada içerik üretmeye 2014 yılında başladı ve kısa sürede Türkiye'nin en tanınan influencerlarından biri haline geldi.

Instagram'da 10+ milyon takipçisi olan Bilic, moda, güzellik ve yaşam tarzı içerikleriyle tanınır. Ayrıca kendi kozmetik markasını kurarak girişimcilik alanında da aktif.

Cesareti ve farklı duruşuyla sosyal medyada önemli bir etki yarattı.`,
      careerSummary: 'Sosyal medya influencerı ve girişimci.',
      funFacts: JSON.stringify([
        'Instagram\'da 10+ milyon takipçisi var',
        'Kendi kozmetik markası var',
        'Türkiye\'nin en çok konuşulan fenomenlerinden',
        'Moda ve güzellik alanında öncü',
      ]),
      metaTitle: 'Danla Bilic Kimdir? Biyografisi | Celebrity Bio',
      metaDescription: 'Danla Bilic\'in hayat hikayesi, sosyal medya kariyeri ve girişimcilik serüveni.',
    },
  })

  await prisma.socialLink.createMany({
    data: [
      {
        celebrityId: danla.id,
        platform: 'instagram',
        handle: 'danlabilic',
        url: 'https://instagram.com/danlabilic',
        followersCount: 10200000,
        isVerified: true,
        sortOrder: 1,
      },
      {
        celebrityId: danla.id,
        platform: 'tiktok',
        handle: 'danlabilic',
        url: 'https://tiktok.com/@danlabilic',
        followersCount: 3100000,
        isVerified: true,
        sortOrder: 2,
      },
    ],
    skipDuplicates: true,
  })

  await prisma.celebrityTag.createMany({
    data: [
      { celebrityId: danla.id, tagId: tags[3].id }, // turkish
      { celebrityId: danla.id, tagId: tags[4].id }, // entrepreneur
      { celebrityId: danla.id, tagId: tags[8].id }, // influencer
      { celebrityId: danla.id, tagId: tags[9].id }, // model
    ],
    skipDuplicates: true,
  })

  console.log('✅ Created celebrity: Danla Bilic')

  // Celebrity 6: Orkun Işıtmak
  const orkun = await prisma.celebrity.upsert({
    where: { slug: 'orkun-isitmak' },
    update: {},
    create: {
      slug: 'orkun-isitmak',
      firstName: 'Orkun',
      lastName: 'Işıtmak',
      fullName: 'Orkun Işıtmak',
      birthDate: new Date('1996-05-19'),
      birthPlace: 'İzmir, Türkiye',
      country: 'Türkiye',
      profession: 'YouTuber, Content Creator, Comedian',
      activeYearsStart: 2014,
      profileImageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&h=800&fit=crop',
      isVerified: true,
      visibility: 'published',
      popularityScore: 81.4,
      totalViews: 72000,
      totalSearches: 26000,
    },
  })

  await prisma.celebrityTranslation.upsert({
    where: {
      celebrityId_languageCode: {
        celebrityId: orkun.id,
        languageCode: 'tr',
      },
    },
    update: {},
    create: {
      celebrityId: orkun.id,
      languageCode: 'tr',
      bioShort: 'Komedi videoları ve özgün içerikleriyle tanınan popüler YouTuber.',
      bioLong: `Orkun Işıtmak, 1996 yılında İzmir'de doğdu. 2014 yılında YouTube'da video yüklemeye başladı ve komedi odaklı içerikleriyle hızla popüler oldu.

YouTube'da 10+ milyon abonesi olan Işıtmak, çeşitli challenge videoları, sosyal deneyler ve komedi sketchleriyle tanınır. Özgün içerik üretimi ve doğal komedyen yeteneğiyle geniş bir kitleye ulaştı.

Ayrıca TV programlarında da yer aldı ve çeşitli markaların reklam yüzü oldu.`,
      careerSummary: 'YouTube\'da komedi içerikleriyle ünlendi.',
      funFacts: JSON.stringify([
        'YouTube\'da 10+ milyon abonesi var',
        'Videolarında doğal komedyen yeteneği',
        'TV programlarında konuk oldu',
        'Markaların reklam yüzü',
      ]),
      metaTitle: 'Orkun Işıtmak Kimdir? Biyografisi | Celebrity Bio',
      metaDescription: 'Orkun Işıtmak\'ın hayat hikayesi, YouTube kariyeri ve komedi içerikleri.',
    },
  })

  await prisma.socialLink.createMany({
    data: [
      {
        celebrityId: orkun.id,
        platform: 'youtube',
        handle: 'Orkun Işıtmak',
        url: 'https://youtube.com/@orkunisitmak',
        followersCount: 10500000,
        isVerified: true,
        sortOrder: 1,
      },
      {
        celebrityId: orkun.id,
        platform: 'instagram',
        handle: 'orkundk',
        url: 'https://instagram.com/orkundk',
        followersCount: 6200000,
        isVerified: true,
        sortOrder: 2,
      },
    ],
    skipDuplicates: true,
  })

  await prisma.celebrityTag.createMany({
    data: [
      { celebrityId: orkun.id, tagId: tags[0].id }, // youtuber
      { celebrityId: orkun.id, tagId: tags[3].id }, // turkish
    ],
    skipDuplicates: true,
  })

  console.log('✅ Created celebrity: Orkun Işıtmak')

  // Celebrity 7: Murat Dalkılıç
  const murat = await prisma.celebrity.upsert({
    where: { slug: 'murat-dalkilic' },
    update: {},
    create: {
      slug: 'murat-dalkilic',
      firstName: 'Murat',
      lastName: 'Dalkılıç',
      fullName: 'Murat Dalkılıç',
      birthDate: new Date('1983-07-07'),
      birthPlace: 'İstanbul, Türkiye',
      country: 'Türkiye',
      profession: 'Singer, Songwriter',
      activeYearsStart: 2007,
      profileImageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&h=800&fit=crop',
      isVerified: true,
      visibility: 'published',
      popularityScore: 79.8,
      totalViews: 68000,
      totalSearches: 24000,
    },
  })

  await prisma.celebrityTranslation.upsert({
    where: {
      celebrityId_languageCode: {
        celebrityId: murat.id,
        languageCode: 'tr',
      },
    },
    update: {},
    create: {
      celebrityId: murat.id,
      languageCode: 'tr',
      bioShort: 'Pop müziğin sevilen isimlerinden Türk şarkıcı ve söz yazarı.',
      bioLong: `Murat Dalkılıç, 1983 yılında İstanbul'da doğdu. 2007 yılında müzik kariyerine başladı ve kısa sürede pop müziğin önde gelen isimlerinden biri haline geldi.

"Bir Hayli", "Neyleyim", "Leyla" gibi hit şarkılarıyla tanınır. Albümleri ve single'ları listelerde üst sıralarda yer aldı.

Hem vokal yeteneği hem de sahne performansıyla beğeni toplayan Dalkılıç, yurt içi ve yurt dışında konserler veriyor.`,
      careerSummary: 'Pop müzik sanatçısı ve söz yazarı.',
      funFacts: JSON.stringify([
        'Çok sayıda hit şarkısı var',
        'Yurt içi ve yurt dışında konserler veriyor',
        'Müzik ödülleri kazandı',
        'Instagram\'da milyonlarca takipçisi var',
      ]),
      metaTitle: 'Murat Dalkılıç Kimdir? Biyografisi | Celebrity Bio',
      metaDescription: 'Murat Dalkılıç\'ın hayat hikayesi, müzik kariyeri ve hit şarkıları.',
    },
  })

  await prisma.socialLink.createMany({
    data: [
      {
        celebrityId: murat.id,
        platform: 'instagram',
        handle: 'muratdalkilic',
        url: 'https://instagram.com/muratdalkilic',
        followersCount: 7200000,
        isVerified: true,
        sortOrder: 1,
      },
      {
        celebrityId: murat.id,
        platform: 'youtube',
        handle: 'Murat Dalkılıç',
        url: 'https://youtube.com/@muratdalkilic',
        followersCount: 1500000,
        isVerified: true,
        sortOrder: 2,
      },
    ],
    skipDuplicates: true,
  })

  await prisma.celebrityTag.createMany({
    data: [
      { celebrityId: murat.id, tagId: tags[3].id }, // turkish
      { celebrityId: murat.id, tagId: tags[6].id }, // musician
    ],
    skipDuplicates: true,
  })

  console.log('✅ Created celebrity: Murat Dalkılıç')

  // Celebrity 8: Hadise
  const hadise = await prisma.celebrity.upsert({
    where: { slug: 'hadise' },
    update: {},
    create: {
      slug: 'hadise',
      firstName: 'Hadise',
      lastName: 'Açıkgöz',
      fullName: 'Hadise Açıkgöz',
      nickname: 'Hadise',
      birthDate: new Date('1985-10-22'),
      birthPlace: 'Mol, Belçika',
      country: 'Türkiye',
      profession: 'Singer, TV Personality',
      activeYearsStart: 2004,
      profileImageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&h=800&fit=crop',
      isFeatured: true,
      isVerified: true,
      visibility: 'published',
      popularityScore: 86.5,
      totalViews: 91000,
      totalSearches: 33000,
    },
  })

  await prisma.celebrityTranslation.upsert({
    where: {
      celebrityId_languageCode: {
        celebrityId: hadise.id,
        languageCode: 'tr',
      },
    },
    update: {},
    create: {
      celebrityId: hadise.id,
      languageCode: 'tr',
      bioShort: 'Türk pop müziğinin sevilen sesi, şarkıcı ve TV şov jürisi.',
      bioLong: `Hadise Açıkgöz, 1985 yılında Belçika'da doğdu. 2004 yılında müzik kariyerine başladı ve Türk pop müziğinin önemli isimlerinden biri haline geldi.

"Düm Tek Tek", "Süperman", "Prenses" gibi hit şarkılarıyla tanınır. 2009 yılında Eurovision Şarkı Yarışması'nda Türkiye'yi temsil etti.

Müzik kariyerinin yanı sıra O Ses Türkiye gibi TV programlarında jüri üyesi olarak da yer aldı.`,
      careerSummary: 'Pop şarkıcı ve TV kişiliği.',
      funFacts: JSON.stringify([
        '2009 Eurovision\'da Türkiye\'yi temsil etti',
        '"Düm Tek Tek" şarkısı Avrupa\'da hit oldu',
        'O Ses Türkiye jüri üyesi',
        'Çok sayıda müzik ödülü kazandı',
      ]),
      metaTitle: 'Hadise Kimdir? Biyografisi | Celebrity Bio',
      metaDescription: 'Hadise\'nin hayat hikayesi, müzik kariyeri ve Eurovision macerası.',
    },
  })

  await prisma.socialLink.createMany({
    data: [
      {
        celebrityId: hadise.id,
        platform: 'instagram',
        handle: 'hadise',
        url: 'https://instagram.com/hadise',
        followersCount: 11800000,
        isVerified: true,
        sortOrder: 1,
      },
      {
        celebrityId: hadise.id,
        platform: 'youtube',
        handle: 'Hadise',
        url: 'https://youtube.com/@hadise',
        followersCount: 2100000,
        isVerified: true,
        sortOrder: 2,
      },
    ],
    skipDuplicates: true,
  })

  await prisma.celebrityTag.createMany({
    data: [
      { celebrityId: hadise.id, tagId: tags[3].id }, // turkish
      { celebrityId: hadise.id, tagId: tags[6].id }, // musician
      { celebrityId: hadise.id, tagId: tags[10].id }, // actor (TV personality)
    ],
    skipDuplicates: true,
  })

  console.log('✅ Created celebrity: Hadise')

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

  // News 2: Nusret opens London restaurant
  const news2 = await prisma.newsItem.create({
    data: {
      slug: 'nusret-london-flagship-opening',
      primaryCelebrityId: nusret.id,
      featuredImageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=630&fit=crop',
      category: 'project',
      visibility: 'published',
      publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    },
  })

  await prisma.newsTranslation.create({
    data: {
      newsId: news2.id,
      languageCode: 'tr',
      title: 'Nusret Londra\'da Dev Restoran Açtı',
      summary: 'Salt Bae lakaplı Nusret Gökçe, Londra\'nın Knightsbridge bölgesinde yeni flagship restoranını açtı.',
      content: 'Dünya çapında tanınan şef Nusret Gökçe, Londra\'nın lüks Knightsbridge bölgesinde 400 kişilik dev restoranını açtı. Açılış gecesinde birçok ünlü isim katıldı.',
    },
  })

  await prisma.newsCelebrity.create({
    data: {
      newsId: news2.id,
      celebrityId: nusret.id,
    },
  })

  // News 3: Reynmen new album
  const news3 = await prisma.newsItem.create({
    data: {
      slug: 'reynmen-new-album-announcement',
      primaryCelebrityId: reynmen.id,
      featuredImageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&h=630&fit=crop',
      category: 'announcement',
      visibility: 'published',
      publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    },
  })

  await prisma.newsTranslation.create({
    data: {
      newsId: news3.id,
      languageCode: 'tr',
      title: 'Reynmen Yeni Albüm Hazırlığında',
      summary: 'Reynmen, sosyal medya hesabından yeni albüm çalışmalarını duyurdu.',
      content: 'Popüler rapçi Reynmen, 2024 yılında çıkaracağı yeni albümü için stüdyoya girdi. Albümde birçok sürpriz işbirliği olacağını açıkladı.',
    },
  })

  await prisma.newsCelebrity.create({
    data: {
      newsId: news3.id,
      celebrityId: reynmen.id,
    },
  })

  // News 4: Hadise Eurovision memories
  const news4 = await prisma.newsItem.create({
    data: {
      slug: 'hadise-eurovision-15th-anniversary',
      primaryCelebrityId: hadise.id,
      featuredImageUrl: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=1200&h=630&fit=crop',
      category: 'career',
      visibility: 'published',
      publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    },
  })

  await prisma.newsTranslation.create({
    data: {
      newsId: news4.id,
      languageCode: 'tr',
      title: 'Hadise Eurovision Anılarını Paylaştı',
      summary: 'Hadise, Eurovision 2009\'daki performansının 15. yılında duygusal paylaşımda bulundu.',
      content: 'Ünlü şarkıcı Hadise, Türkiye\'yi Eurovision\'da temsil ettiği 2009 yılının üzerinden 15 yıl geçmesi vesilesiyle özel bir paylaşım yaptı. "Düm Tek Tek" şarkısıyla unutulmaz bir performans sergilemişti.',
    },
  })

  await prisma.newsCelebrity.create({
    data: {
      newsId: news4.id,
      celebrityId: hadise.id,
    },
  })

  // News 5: Orkun Işıtmak charity project
  const news5 = await prisma.newsItem.create({
    data: {
      slug: 'orkun-isitmak-charity-campaign',
      primaryCelebrityId: orkun.id,
      featuredImageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1200&h=630&fit=crop',
      category: 'social',
      visibility: 'published',
      publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    },
  })

  await prisma.newsTranslation.create({
    data: {
      newsId: news5.id,
      languageCode: 'tr',
      title: 'Orkun Işıtmak Hayır Kampanyası Başlattı',
      summary: 'YouTuber Orkun Işıtmak, deprem bölgesi için geniş çaplı bir yardım kampanyası başlattı.',
      content: 'Ünlü YouTuber Orkun Işıtmak, depremden etkilenen bölgelere yardım için sosyal medya üzerinden kampanya başlattı. İlk 24 saatte büyük destek aldı.',
    },
  })

  await prisma.newsCelebrity.create({
    data: {
      newsId: news5.id,
      celebrityId: orkun.id,
    },
  })

  console.log('✅ Created 5 news items')

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

  await prisma.popularityStat.create({
    data: {
      celebrityId: nusret.id,
      periodType: 'weekly',
      periodStart: weekAgo,
      periodEnd: today,
      viewCount: 110000,
      searchCount: 42000,
      popularityScore: 92.8,
      rankPosition: 3,
    },
  })

  await prisma.popularityStat.create({
    data: {
      celebrityId: hadise.id,
      periodType: 'weekly',
      periodStart: weekAgo,
      periodEnd: today,
      viewCount: 91000,
      searchCount: 33000,
      popularityScore: 86.5,
      rankPosition: 4,
    },
  })

  await prisma.popularityStat.create({
    data: {
      celebrityId: reynmen.id,
      periodType: 'weekly',
      periodStart: weekAgo,
      periodEnd: today,
      viewCount: 87000,
      searchCount: 31000,
      popularityScore: 85.6,
      rankPosition: 5,
    },
  })

  await prisma.popularityStat.create({
    data: {
      celebrityId: danla.id,
      periodType: 'weekly',
      periodStart: weekAgo,
      periodEnd: today,
      viewCount: 79000,
      searchCount: 28000,
      popularityScore: 83.2,
      rankPosition: 6,
    },
  })

  await prisma.popularityStat.create({
    data: {
      celebrityId: orkun.id,
      periodType: 'weekly',
      periodStart: weekAgo,
      periodEnd: today,
      viewCount: 72000,
      searchCount: 26000,
      popularityScore: 81.4,
      rankPosition: 7,
    },
  })

  await prisma.popularityStat.create({
    data: {
      celebrityId: murat.id,
      periodType: 'weekly',
      periodStart: weekAgo,
      periodEnd: today,
      viewCount: 68000,
      searchCount: 24000,
      popularityScore: 79.8,
      rankPosition: 8,
    },
  })

  console.log('✅ Created popularity stats for all 8 celebrities')

  console.log('\n🎉 Database seeding completed successfully!')
  console.log('\n📊 Summary:')
  console.log('   - 1 admin user')
  console.log('   - 11 tags (YouTuber, TikTok Star, Chef, Turkish, Entrepreneur, Gaming, Musician, Rapper, Influencer, Model, Actor)')
  console.log('   - 8 celebrities:')
  console.log('     • CZN Burak (Chef, Entrepreneur)')
  console.log('     • Enes Batur (YouTuber, Gamer)')
  console.log('     • Nusret Gökçe (Chef, Restaurateur)')
  console.log('     • Reynmen (Rapper, YouTuber)')
  console.log('     • Danla Bilic (Influencer, Entrepreneur)')
  console.log('     • Orkun Işıtmak (YouTuber, Comedian)')
  console.log('     • Murat Dalkılıç (Singer)')
  console.log('     • Hadise (Singer, TV Personality)')
  console.log('   - 17 social media links')
  console.log('   - 5 news items')
  console.log('   - 8 popularity stats')
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
