// Biyografi Detay Sayfası
// Path: src/app/[locale]/u/[slug]/page.tsx

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCelebrityBySlug } from '@/lib/services/celebrity.service';
import { getSimilarCelebrities } from '@/lib/services/recommendation.service';
import { getRelatedNews } from '@/lib/services/news.service';
import { logView } from '@/lib/services/analytics.service';
import { headers } from 'next/headers';

import ProfileHeader from '@/components/celebrity/ProfileHeader';
import BioSection from '@/components/celebrity/BioSection';
import FunFacts from '@/components/celebrity/FunFacts';
import SocialStats from '@/components/celebrity/SocialStats';
import TagList from '@/components/celebrity/TagList';
import SimilarPeople from '@/components/celebrity/SimilarPeople';
import RelatedNews from '@/components/celebrity/RelatedNews';
import JsonLd from '@/components/seo/JsonLd';
import { generatePersonSchema } from '@/lib/utils/seo';

interface CelebrityPageProps {
  params: {
    locale: string;
    slug: string;
  };
}

// Metadata generation for SEO
export async function generateMetadata({
  params: { slug, locale },
}: CelebrityPageProps): Promise<Metadata> {
  const celebrity = await getCelebrityBySlug(slug, locale);

  if (!celebrity) {
    return {
      title: 'Ünlü Bulunamadı',
    };
  }

  const translation = celebrity.translations.find(
    (t) => t.languageCode === locale
  );

  const title = `${celebrity.fullName} Kimdir? Biyografisi, Yaşı, Burcu | Celebrity Bio`;
  const description = translation?.bioShort || celebrity.profession || '';

  return {
    title,
    description,
    keywords: [
      celebrity.fullName,
      celebrity.nickname,
      celebrity.profession,
      ...celebrity.tags.map((ct) => ct.tag.slug),
    ].filter(Boolean) as string[],
    openGraph: {
      type: 'profile',
      firstName: celebrity.firstName,
      lastName: celebrity.lastName,
      username: celebrity.nickname || undefined,
      images: [
        {
          url: celebrity.profileImageUrl || '/default-avatar.jpg',
          width: 800,
          height: 800,
          alt: celebrity.fullName,
        },
      ],
      locale: locale === 'tr' ? 'tr_TR' : 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: celebrity.fullName,
      description,
      images: [celebrity.profileImageUrl || '/default-avatar.jpg'],
    },
    alternates: {
      canonical: `https://celebritybio.com/${locale}/u/${slug}`,
      languages: {
        'tr': `https://celebritybio.com/tr/u/${slug}`,
        'en': `https://celebritybio.com/en/u/${slug}`,
      },
    },
  };
}

// Generate static params for popular celebrities (SSG)
export async function generateStaticParams() {
  // Pre-render top 100 most popular celebrities
  const { prisma } = await import('@/lib/db/prisma');

  const celebrities = await prisma.celebrity.findMany({
    where: {
      visibility: 'published',
      deletedAt: null,
    },
    orderBy: {
      popularityScore: 'desc',
    },
    take: 100,
    select: {
      slug: true,
    },
  });

  // Generate params for both locales
  const params = [];
  for (const celeb of celebrities) {
    params.push({ locale: 'tr', slug: celeb.slug });
    params.push({ locale: 'en', slug: celeb.slug });
  }

  return params;
}

export default async function CelebrityPage({
  params: { slug, locale },
}: CelebrityPageProps) {
  const celebrity = await getCelebrityBySlug(slug, locale);

  if (!celebrity) {
    notFound();
  }

  const translation = celebrity.translations.find(
    (t) => t.languageCode === locale
  );

  // Paralel fetch related data
  const [similarCelebrities, relatedNews] = await Promise.all([
    getSimilarCelebrities(celebrity.id, 8),
    getRelatedNews(celebrity.id, locale, 5),
  ]);

  // Log view (async, non-blocking)
  const headersList = headers();
  const userAgent = headersList.get('user-agent') || undefined;
  const referrer = headersList.get('referer') || undefined;

  logView({
    celebrityId: celebrity.id,
    pageType: 'profile',
    referrer,
    userAgent,
  }).catch(console.error); // Fire and forget

  // Generate Person schema for SEO
  const personSchema = generatePersonSchema(celebrity, locale);

  return (
    <>
      {/* JSON-LD Structured Data */}
      <JsonLd data={personSchema} />

      <main className="min-h-screen bg-white">
        {/* Profile Header */}
        <ProfileHeader celebrity={celebrity} translation={translation} locale={locale} />

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Bio Section */}
              <BioSection celebrity={celebrity} translation={translation} />

              {/* Fun Facts */}
              {translation?.funFacts && (
                <FunFacts facts={translation.funFacts as string[]} locale={locale} />
              )}

              {/* Related News */}
              {relatedNews.length > 0 && (
                <RelatedNews news={relatedNews} locale={locale} />
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Social Stats */}
              <SocialStats socialLinks={celebrity.socialLinks} />

              {/* Tags */}
              <TagList tags={celebrity.tags.map((ct) => ct.tag)} locale={locale} />
            </div>
          </div>

          {/* Similar People */}
          {similarCelebrities.length > 0 && (
            <div className="mt-12">
              <SimilarPeople celebrities={similarCelebrities} locale={locale} />
            </div>
          )}
        </div>
      </main>
    </>
  );
}

// ISR: Revalidate every 1 hour
export const revalidate = 3600;

// Dynamic params will be generated on-demand (ISR fallback)
export const dynamicParams = true;
