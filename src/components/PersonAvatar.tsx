import React from 'react';

interface PersonAvatarProps {
  photo?: string;
  gender?: 'male' | 'female';
  name?: string;
  color?: string;
  size?: number; // pixel diameter
  className?: string;
  showStatusDot?: boolean;
  status?: string;
}

// Well-known Iranian female first names for automatic fallback if gender not specified
const KNOWN_FEMALE_NAMES = new Set([
  'مریم', 'فاطمه', 'زهرا', 'سارا', 'نرگس', 'نگین', 'الهام', 'مینا', 'شیرین', 'مهسا',
  'پریا', 'ندا', 'سمیرا', 'نسرین', 'رویا', 'فرشته', 'سپیده', 'آرزو', 'پگاه', 'یلدا',
  'شبنم', 'بهاره', 'پرستو', 'لیلا', 'آیدا', 'الناز', 'نیلوفر', 'یاسمن', 'ساناز', 'طاهره'
]);

export function detectGender(name?: string, explicitGender?: 'male' | 'female'): 'male' | 'female' {
  if (explicitGender) return explicitGender;
  if (!name) return 'male';
  const firstName = name.trim().split(/\s+/)[0];
  if (KNOWN_FEMALE_NAMES.has(firstName)) return 'female';
  return 'male';
}

export default function PersonAvatar({
  photo,
  gender,
  name = '',
  color = '#6366F1',
  size = 52,
  className = '',
  showStatusDot = true,
  status = 'فعال'
}: PersonAvatarProps) {
  const resolvedGender = detectGender(name, gender);
  const isActive = status === 'فعال' || status === 'Active';

  return (
    <div
      className={`relative inline-flex items-center justify-center flex-shrink-0 rounded-full select-none ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      {photo && (photo.startsWith('data:image') || photo.startsWith('http') || photo.startsWith('/')) ? (
        <img
          src={photo}
          alt={name}
          className="w-full h-full rounded-full object-cover border-2 border-white dark:border-slate-800 shadow-sm"
        />
      ) : resolvedGender === 'female' ? (
        /* ==================== FEMALE PROFESSIONAL CHARACTER AVATAR ==================== */
        <div
          className="w-full h-full rounded-full overflow-hidden border-2 border-white dark:border-slate-800 shadow-sm flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #F43F5E 0%, #FB7185 100%)' }}
          title={`${name} (خانم)`}
        >
          <svg
            viewBox="0 0 64 64"
            className="w-full h-full drop-shadow-sm"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Background Soft Glow */}
            <circle cx="32" cy="32" r="32" fill="url(#femaleGlow)" fillOpacity="0.15" />
            <defs>
              <linearGradient id="femaleGlow" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FFF" />
                <stop offset="1" stopColor="#FDA4AF" />
              </linearGradient>
            </defs>

            {/* Back Hair / Volume */}
            <path
              d="M17 31C17 20 22 13 32 13C42 13 47 20 47 31C47 39 45 46 43 49C40 46 41 37 41 33C37 36 27 36 23 33C23 37 24 46 21 49C19 46 17 39 17 31Z"
              fill="#3730A3"
            />

            {/* Shoulders / Professional Blazer */}
            <path
              d="M12 58C12 47 20 42 32 42C44 42 52 47 52 58V64H12V58Z"
              fill="#4C1D95"
            />
            {/* Collar V-Neck */}
            <path d="M25 43L32 53L39 43L35 42H29L25 43Z" fill="#FCE7F3" />
            <path d="M28 47L32 53L36 47" stroke="#BE185D" strokeWidth="1.5" strokeLinecap="round" />

            {/* Neck */}
            <path d="M28 35H36V45C36 47 34 48 32 48C30 48 28 47 28 45V35Z" fill="#FCD34D" />

            {/* Face Shape */}
            <path
              d="M22 27C22 21 26 17 32 17C38 17 42 21 42 27C42 34 38 38 32 38C26 38 22 34 22 27Z"
              fill="#FDE68A"
            />

            {/* Female Hair Front & Bangs */}
            <path
              d="M20 24C23 18 27 15 32 15C38 15 43 18 44 23C42 21 38 19 33 21C27 23 23 27 20 28V24Z"
              fill="#4338CA"
            />
            <path
              d="M19 26C20 34 22 37 23 40C22 36 21 30 21 26H19Z"
              fill="#4338CA"
            />
            <path
              d="M45 26C44 34 42 37 41 40C42 36 43 30 43 26H45Z"
              fill="#4338CA"
            />

            {/* Eyes */}
            <circle cx="27.5" cy="28.5" r="1.5" fill="#1E1B4B" />
            <circle cx="36.5" cy="28.5" r="1.5" fill="#1E1B4B" />

            {/* Eyelashes / Feminine touch */}
            <path d="M26 27L29 27.5" stroke="#1E1B4B" strokeWidth="1" strokeLinecap="round" />
            <path d="M38 27L35 27.5" stroke="#1E1B4B" strokeWidth="1" strokeLinecap="round" />

            {/* Smile / Lips */}
            <path
              d="M29.5 33.5C30.5 35 33.5 35 34.5 33.5"
              stroke="#E11D48"
              strokeWidth="1.5"
              strokeLinecap="round"
            />

            {/* Small Earrings */}
            <circle cx="21" cy="29" r="1.2" fill="#F59E0B" />
            <circle cx="43" cy="29" r="1.2" fill="#F59E0B" />
          </svg>
        </div>
      ) : (
        /* ==================== MALE PROFESSIONAL CHARACTER AVATAR ==================== */
        <div
          className="w-full h-full rounded-full overflow-hidden border-2 border-white dark:border-slate-800 shadow-sm flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)' }}
          title={`${name} (آقا)`}
        >
          <svg
            viewBox="0 0 64 64"
            className="w-full h-full drop-shadow-sm"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Background Soft Glow */}
            <circle cx="32" cy="32" r="32" fill="url(#maleGlow)" fillOpacity="0.15" />
            <defs>
              <linearGradient id="maleGlow" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FFF" />
                <stop offset="1" stopColor="#93C5FD" />
              </linearGradient>
            </defs>

            {/* Shoulders / Suit Jacket */}
            <path
              d="M10 58C10 46 19 41 32 41C45 41 54 46 54 58V64H10V58Z"
              fill="#1E293B"
            />

            {/* White Dress Shirt V */}
            <path d="M26 42L32 52L38 42H26Z" fill="#F8FAFC" />

            {/* Silk Tie */}
            <path d="M30.5 44L32 46L33.5 44L33 55L32 58L31 55L30.5 44Z" fill="#DC2626" />

            {/* Suit Lapels */}
            <path d="M23 42L29 55L26 58L19 46L23 42Z" fill="#0F172A" />
            <path d="M41 42L35 55L38 58L45 46L41 42Z" fill="#0F172A" />

            {/* Neck */}
            <path d="M27 34H37V44H27V34Z" fill="#FCD34D" />

            {/* Face Shape */}
            <path
              d="M22 25C22 19 26 16 32 16C38 16 42 19 42 25C42 33 38 37 32 37C26 37 22 33 22 25Z"
              fill="#FDE68A"
            />

            {/* Male Hair / Modern Pompadour */}
            <path
              d="M20 22C20 16 24 12 32 12C39 12 43 15 44 20C42 19 39 17 34 18C28 19 24 23 20 24V22Z"
              fill="#1F2937"
            />
            <path d="M21 22C22 26 22 28 22 30H20C19.5 27 20 24 21 22Z" fill="#1F2937" />
            <path d="M43 22C42 26 42 28 42 30H44C44.5 27 44 24 43 22Z" fill="#1F2937" />

            {/* Eyes */}
            <circle cx="28" cy="27" r="1.6" fill="#0F172A" />
            <circle cx="36" cy="27" r="1.6" fill="#0F172A" />

            {/* Eyebrows */}
            <path d="M26 24.5C27 24 29 24 30 24.5" stroke="#1F2937" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M34 24.5C35 24 37 24 38 24.5" stroke="#1F2937" strokeWidth="1.2" strokeLinecap="round" />

            {/* Smile */}
            <path
              d="M29.5 32.5C30.5 34 33.5 34 34.5 32.5"
              stroke="#B45309"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      )}

      {/* Online/Active Dot */}
      {showStatusDot && (
        <span
          className={`absolute bottom-0 right-0 rounded-full border-2 border-white dark:border-slate-900 ${
            isActive ? 'bg-emerald-500 ring-1 ring-emerald-400' : 'bg-slate-400'
          }`}
          style={{ width: `${Math.max(10, size * 0.24)}px`, height: `${Math.max(10, size * 0.24)}px` }}
          title={isActive ? 'وضعیت: فعال' : 'وضعیت: غیرفعال'}
        />
      )}
    </div>
  );
}
