// Celebrity API Endpoint
// Path: src/app/api/celebrities/[slug]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { redis } from '@/lib/cache/redis';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'en';

    // Cache key
    const cacheKey = `celebrity:${slug}:${locale}`;

    // Try cache first
    const cached = await redis.get(cacheKey);
    if (cached) {
      return NextResponse.json(JSON.parse(cached), {
        headers: {
          'X-Cache': 'HIT',
        },
      });
    }

    // Fetch from database
    const celebrity = await prisma.celebrity.findUnique({
      where: { slug },
      include: {
        translations: {
          where: {
            languageCode: locale,
          },
        },
        socialLinks: {
          orderBy: {
            sortOrder: 'asc',
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!celebrity || celebrity.visibility !== 'published') {
      return NextResponse.json(
        { error: 'Celebrity not found' },
        { status: 404 }
      );
    }

    // Format response
    const response = {
      id: celebrity.id,
      slug: celebrity.slug,
      fullName: celebrity.fullName,
      firstName: celebrity.firstName,
      lastName: celebrity.lastName,
      nickname: celebrity.nickname,
      birthDate: celebrity.birthDate,
      birthPlace: celebrity.birthPlace,
      country: celebrity.country,
      profession: celebrity.profession,
      profileImage: celebrity.profileImageUrl,
      coverImage: celebrity.coverImageUrl,
      isVerified: celebrity.isVerified,
      popularityScore: Number(celebrity.popularityScore),
      translation: celebrity.translations[0] || null,
      socialLinks: celebrity.socialLinks,
      tags: celebrity.tags.map((ct) => ({
        id: ct.tag.id,
        slug: ct.tag.slug,
        name: locale === 'tr' ? ct.tag.nameTr : ct.tag.nameEn,
      })),
    };

    // Cache for 1 hour
    await redis.setex(cacheKey, 3600, JSON.stringify(response));

    return NextResponse.json(response, {
      headers: {
        'X-Cache': 'MISS',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
