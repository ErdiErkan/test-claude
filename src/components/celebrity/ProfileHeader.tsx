// Profil Header Bileşeni
// Path: src/components/celebrity/ProfileHeader.tsx

'use client';

import Image from 'next/image';
import { Celebrity, CelebrityTranslation } from '@prisma/client';
import { calculateAge, getZodiacSign } from '@/lib/utils/date';
import { MapPin, Calendar, Briefcase, CheckCircle } from 'lucide-react';
import SocialLinks from './SocialLinks';

interface ProfileHeaderProps {
  celebrity: Celebrity & {
    socialLinks: any[];
  };
  translation: CelebrityTranslation | undefined;
  locale: string;
}

export default function ProfileHeader({
  celebrity,
  translation,
  locale,
}: ProfileHeaderProps) {
  const age = celebrity.birthDate ? calculateAge(celebrity.birthDate) : null;
  const zodiacSign = celebrity.birthDate ? getZodiacSign(celebrity.birthDate) : null;

  const labels = {
    tr: {
      verified: 'Doğrulanmış Profil',
      age: 'yaş',
      birthDate: 'Doğum Tarihi',
      birthPlace: 'Doğum Yeri',
      profession: 'Meslek',
      activeYears: 'Aktif Yıllar',
      present: 'Günümüz',
    },
    en: {
      verified: 'Verified Profile',
      age: 'years old',
      birthDate: 'Birth Date',
      birthPlace: 'Birth Place',
      profession: 'Profession',
      activeYears: 'Active Years',
      present: 'Present',
    },
  };

  const t = labels[locale as keyof typeof labels] || labels.en;

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 border-b">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Profile Image */}
          <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-2xl overflow-hidden shadow-2xl flex-shrink-0">
            <Image
              src={celebrity.profileImageUrl || '/default-avatar.jpg'}
              alt={celebrity.fullName}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 192px, 256px"
            />
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-start gap-3">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                {celebrity.fullName}
              </h1>
              {celebrity.isVerified && (
                <div className="flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                  <CheckCircle className="w-4 h-4" />
                  <span>{t.verified}</span>
                </div>
              )}
            </div>

            {celebrity.nickname && (
              <p className="text-xl text-gray-600 mt-2">{celebrity.nickname}</p>
            )}

            {celebrity.profession && (
              <p className="text-lg text-purple-600 font-medium mt-2">
                {celebrity.profession}
              </p>
            )}

            {/* Bio Short */}
            {translation?.bioShort && (
              <p className="text-gray-700 mt-4 text-lg leading-relaxed max-w-2xl">
                {translation.bioShort}
              </p>
            )}

            {/* Quick Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              {celebrity.birthDate && (
                <div className="flex items-center gap-2 text-gray-700">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  <span>
                    {new Date(celebrity.birthDate).toLocaleDateString(locale)}
                    {age && ` (${age} ${t.age})`}
                    {zodiacSign && ` ${zodiacSign}`}
                  </span>
                </div>
              )}

              {celebrity.birthPlace && (
                <div className="flex items-center gap-2 text-gray-700">
                  <MapPin className="w-5 h-5 text-purple-600" />
                  <span>{celebrity.birthPlace}</span>
                </div>
              )}

              {celebrity.activeYearsStart && (
                <div className="flex items-center gap-2 text-gray-700">
                  <Briefcase className="w-5 h-5 text-purple-600" />
                  <span>
                    {celebrity.activeYearsStart} - {celebrity.activeYearsEnd || t.present}
                  </span>
                </div>
              )}
            </div>

            {/* Social Links */}
            <div className="mt-6">
              <SocialLinks links={celebrity.socialLinks} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
