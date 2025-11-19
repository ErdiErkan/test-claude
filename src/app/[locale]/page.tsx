// Ana Sayfa - Celebrity Bio Platform
// Path: src/app/[locale]/page.tsx

import { Metadata } from 'next';
import { getCelebrityOfTheDay } from '@/lib/services/celebrity.service';
import { getCelebritiesBornToday } from '@/lib/services/celebrity.service';
import { getTrendingCelebrities } from '@/lib/services/celebrity.service';
import { getTopSearched } from '@/lib/services/analytics.service';

import CelebrityOfTheDay from '@/components/home/CelebrityOfTheDay';
import BornToday from '@/components/home/BornToday';
import TrendingBios from '@/components/home/TrendingBios';
import TopSearched from '@/components/home/TopSearched';
import FeaturedCategories from '@/components/home/FeaturedCategories';
import HeroSection from '@/components/home/HeroSection';

interface HomePageProps {
  params: {
    locale: string;
  };
}

export async function generateMetadata({
  params: { locale },
}: HomePageProps): Promise<Metadata> {
  const titles = {
    tr: 'Ünlü ve Fenomen Biyografileri | Celebrity Bio',
    en: 'Celebrity & Influencer Biographies | Celebrity Bio',
  };

  const descriptions = {
    tr: 'Türkiye ve dünyanın en ünlü YouTuber, TikTok fenomeni, oyuncu ve şarkıcılarının hayat hikayeleri, sosyal medya hesapları ve ilginç bilgileri.',
    en: "Life stories, social media accounts and interesting facts of the world's most famous YouTubers, TikTok stars, actors and singers.",
  };

  return {
    title: titles[locale as keyof typeof titles] || titles.en,
    description: descriptions[locale as keyof typeof descriptions] || descriptions.en,
    openGraph: {
      type: 'website',
      locale: locale === 'tr' ? 'tr_TR' : 'en_US',
      url: `https://celebritybio.com/${locale}`,
      siteName: 'Celebrity Bio',
    },
    alternates: {
      canonical: `https://celebritybio.com/${locale}`,
      languages: {
        'tr': 'https://celebritybio.com/tr',
        'en': 'https://celebritybio.com/en',
      },
    },
  };
}

export default async function HomePage({ params: { locale } }: HomePageProps) {
  // Paralel data fetching (Next.js 14 optimization)
  const [celebrityOfDay, bornToday, trending, topSearched] = await Promise.all([
    getCelebrityOfTheDay(locale),
    getCelebritiesBornToday(new Date(), locale),
    getTrendingCelebrities({ period: 'week', limit: 12, locale }),
    getTopSearched({ period: 'week', limit: 10 }),
  ]);

  return (
    <main className="min-h-screen">
      {/* Hero Section with Search */}
      <HeroSection locale={locale} />

      {/* Günün Ünlüsü */}
      {celebrityOfDay && (
        <section className="container mx-auto px-4 py-12">
          <CelebrityOfTheDay celebrity={celebrityOfDay} locale={locale} />
        </section>
      )}

      {/* Bugün Doğan Ünlüler */}
      {bornToday.length > 0 && (
        <section className="container mx-auto px-4 py-12 bg-gray-50">
          <BornToday celebrities={bornToday} locale={locale} />
        </section>
      )}

      {/* En Çok Arananlar */}
      {topSearched.length > 0 && (
        <section className="container mx-auto px-4 py-12">
          <TopSearched celebrities={topSearched} locale={locale} />
        </section>
      )}

      {/* Trend Biyografiler */}
      {trending.length > 0 && (
        <section className="container mx-auto px-4 py-12 bg-gray-50">
          <TrendingBios celebrities={trending} locale={locale} />
        </section>
      )}

      {/* Kategoriler */}
      <section className="container mx-auto px-4 py-12">
        <FeaturedCategories locale={locale} />
      </section>
    </main>
  );
}

// Next.js 14: Enable ISR with revalidation
export const revalidate = 3600; // 1 saat
