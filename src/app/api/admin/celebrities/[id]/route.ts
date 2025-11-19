import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import { prisma } from '@/lib/db/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check if slug is taken by another celebrity
    const existing = await prisma.celebrity.findUnique({
      where: { slug },
    })

    if (existing && existing.id !== params.id) {
      return NextResponse.json(
        { error: 'Slug already exists' },
        { status: 400 }
      )
    }

    // Update celebrity and translations
    const celebrity = await prisma.celebrity.update({
      where: { id: params.id },
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
        updatedAt: new Date(),
      },
    })

    // Update Turkish translation
    await prisma.celebrityTranslation.upsert({
      where: {
        celebrityId_languageCode: {
          celebrityId: params.id,
          languageCode: 'tr',
        },
      },
      create: {
        celebrityId: params.id,
        languageCode: 'tr',
        bioShort: bioShortTr,
        bioFull: bioFullTr,
        career: careerTr,
        personalLife: personalLifeTr,
      },
      update: {
        bioShort: bioShortTr,
        bioFull: bioFullTr,
        career: careerTr,
        personalLife: personalLifeTr,
      },
    })

    // Update English translation
    await prisma.celebrityTranslation.upsert({
      where: {
        celebrityId_languageCode: {
          celebrityId: params.id,
          languageCode: 'en',
        },
      },
      create: {
        celebrityId: params.id,
        languageCode: 'en',
        bioShort: bioShortEn,
        bioFull: bioFullEn,
        career: careerEn,
        personalLife: personalLifeEn,
      },
      update: {
        bioShort: bioShortEn,
        bioFull: bioFullEn,
        career: careerEn,
        personalLife: personalLifeEn,
      },
    })

    return NextResponse.json(celebrity)
  } catch (error: any) {
    console.error('Error updating celebrity:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update celebrity' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Soft delete
    await prisma.celebrity.update({
      where: { id: params.id },
      data: {
        deletedAt: new Date(),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting celebrity:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete celebrity' },
      { status: 500 }
    )
  }
}
