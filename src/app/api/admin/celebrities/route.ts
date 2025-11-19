import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import { prisma } from '@/lib/db/prisma'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const {
      fullName,
      nickname,
      slug,
      birthDate,
      deathDate,
      profession,
      nationality,
      profileImageUrl,
      coverImageUrl,
      visibility,
      isFeatured,
      isVerified,
      bioShortTr,
      bioFullTr,
      careerTr,
      personalLifeTr,
      bioShortEn,
      bioFullEn,
      careerEn,
      personalLifeEn,
    } = body

    // Check if slug already exists
    const existing = await prisma.celebrity.findUnique({
      where: { slug },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Slug already exists' },
        { status: 400 }
      )
    }

    const celebrity = await prisma.celebrity.create({
      data: {
        fullName,
        nickname,
        slug,
        birthDate: birthDate ? new Date(birthDate) : null,
        deathDate: deathDate ? new Date(deathDate) : null,
        profession,
        nationality,
        profileImageUrl,
        coverImageUrl,
        visibility,
        isFeatured,
        isVerified,
        translations: {
          create: [
            {
              languageCode: 'tr',
              bioShort: bioShortTr,
              bioFull: bioFullTr,
              career: careerTr,
              personalLife: personalLifeTr,
            },
            {
              languageCode: 'en',
              bioShort: bioShortEn,
              bioFull: bioFullEn,
              career: careerEn,
              personalLife: personalLifeEn,
            },
          ],
        },
      },
    })

    return NextResponse.json(celebrity, { status: 201 })
  } catch (error: any) {
    console.error('Error creating celebrity:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create celebrity' },
      { status: 500 }
    )
  }
}
