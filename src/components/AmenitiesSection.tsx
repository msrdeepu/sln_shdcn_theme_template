import React, { useMemo } from 'react';
import type { VentureData, AmenityItem } from '../types';

interface AmenitiesSectionProps {
  venture: VentureData;
}

/**
 * Rich, colorful custom vector illustrations matching the client's reference catalog.
 * Guarantees every single real-estate amenity displays an illustrated graphic.
 */
function renderAmenitySvg(title: string, category?: string) {
  const t = (title || '').toLowerCase().trim();

  // 1. GRAND ENTRANCE ARCH
  if (t.includes('arch') || t.includes('entrance') || t.includes('gate')) {
    return (
      <svg width="100%" height="100%" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="52" width="44" height="6" rx="2" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="1.5" />
        <rect x="14" y="22" width="10" height="30" rx="1.5" fill="#EAB308" stroke="#CA8A04" strokeWidth="1.5" />
        <rect x="40" y="22" width="10" height="30" rx="1.5" fill="#EAB308" stroke="#CA8A04" strokeWidth="1.5" />
        <rect x="16" y="26" width="6" height="8" rx="1" fill="#FEF08A" />
        <rect x="16" y="38" width="6" height="8" rx="1" fill="#FEF08A" />
        <rect x="42" y="26" width="6" height="8" rx="1" fill="#FEF08A" />
        <rect x="42" y="38" width="6" height="8" rx="1" fill="#FEF08A" />
        <path d="M12 22H52V14C52 12.8954 51.1046 12 50 12H14C12.8954 12 12 12.8954 12 14V22Z" fill="#FACC15" stroke="#CA8A04" strokeWidth="1.5" />
        <path d="M24 22V36C24 40.4183 27.5817 44 32 44C36.4183 44 40 40.4183 40 36V22" fill="#FEF9C3" stroke="#CA8A04" strokeWidth="1.5" />
        <path d="M14 16H50" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 3" />
        <circle cx="32" cy="17" r="2.5" fill="#DC2626" />
      </svg>
    );
  }

  // 2. UNDERGROUND ELECTRICITY CONNECTION / POWER / LIGHT
  if (t.includes('electric') || t.includes('power') || t.includes('bulb') || t.includes('transformer')) {
    return (
      <svg width="100%" height="100%" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M32 6V11" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M13.6 13.6L17.2 17.2" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M50.4 13.6L46.8 17.2" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M6 32H11" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M53 32H58" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M32 14C23.1634 14 16 21.1634 16 30C16 35.8562 19.1415 40.9786 23.8344 43.7607C24.8778 44.3792 25.5 45.4975 25.5 46.7083V47H38.5V46.7083C38.5 45.4975 39.1222 44.3792 40.1656 43.7607C44.8585 40.9786 48 35.8562 48 30C48 21.1634 40.8366 14 32 14Z" fill="#FBBF24" stroke="#D97706" strokeWidth="1.5" />
        <ellipse cx="32" cy="30" rx="9" ry="11" fill="#FEF3C7" />
        <path d="M26 49H38V53C38 54.1046 37.1046 55 36 55H28C26.8954 55 26 54.1046 26 53V49Z" fill="#64748B" stroke="#334155" strokeWidth="1.5" />
        <path d="M28 55H36V57C36 58.1046 35.1046 59 34 59H30C28.8954 59 28 58.1046 28 57V55Z" fill="#475569" />
        <path d="M28 30L31 25L30 31L35 27L32 37" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  // 3. AVENUE PLANTATION / TREES / GREENERY
  if (t.includes('plantation') || t.includes('tree') || t.includes('green') || (t.includes('park') && !t.includes('children'))) {
    return (
      <svg width="100%" height="100%" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 50C8 46.6863 20 44 32 44C44 44 56 46.6863 56 50H8Z" fill="#22C55E" />
        <rect x="6" y="50" width="52" height="6" rx="2" fill="#15803D" />
        <rect x="30" y="30" width="4" height="18" rx="1" fill="#78350F" />
        <rect x="18" y="34" width="3" height="14" rx="1" fill="#78350F" />
        <rect x="43" y="34" width="3" height="14" rx="1" fill="#78350F" />
        <circle cx="19.5" cy="27.5" r="9.5" fill="#16A34A" stroke="#14532D" strokeWidth="1.5" />
        <circle cx="44.5" cy="27.5" r="9.5" fill="#16A34A" stroke="#14532D" strokeWidth="1.5" />
        <circle cx="32" cy="22" r="13" fill="#22C55E" stroke="#15803D" strokeWidth="1.5" />
        <circle cx="28" cy="18" r="3" fill="#86EFAC" />
        <circle cx="36" cy="22" r="2.5" fill="#86EFAC" />
        <path d="M12 47V53M22 47V53M32 47V53M42 47V53M52 47V53" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
        <path d="M10 49H54" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  // 4. STREET LIGHTS / LIGHTS
  if (t.includes('street light') || t.includes('street') || t.includes('light')) {
    return (
      <svg width="100%" height="100%" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="22" y="54" width="20" height="5" rx="1.5" fill="#64748B" stroke="#334155" strokeWidth="1.5" />
        <path d="M30 54V22C30 14 35 9 43 9C47 9 49 11 50 14" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" />
        <path d="M44 14H54L52 19H46L44 14Z" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />
        <path d="M47 19L41 33H57L51 19" fill="#FEF08A" opacity="0.65" />
        <circle cx="49" cy="21" r="2.5" fill="#FBBF24" />
      </svg>
    );
  }

  // 5. CHILDREN PARK / PLAY AREA
  if (t.includes('children') || t.includes('play') || t.includes('kid')) {
    return (
      <svg width="100%" height="100%" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 16L6 54M12 16L18 54M12 16H40M40 16L34 54M40 16L46 54" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M8 40H16M36 40H44" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
        <path d="M22 16V38M30 16V38" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" />
        <rect x="18" y="38" width="16" height="4" rx="2" fill="#EF4444" />
        <rect x="42" y="24" width="14" height="24" rx="2" fill="#06B6D4" stroke="#0891B2" strokeWidth="1.5" />
        <path d="M42 24L49 14L56 24H42Z" fill="#F97316" />
        <circle cx="49" cy="33" r="3" fill="#FFFFFF" />
        <path d="M56 38L61 54H56" stroke="#EF4444" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  // 6. DUPLEX VILLA / VILLA PLOTS / RESIDENCE
  if (t.includes('villa') || t.includes('duplex') || t.includes('house') || t.includes('home')) {
    return (
      <svg width="100%" height="100%" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="12" y="26" width="40" height="30" rx="2" fill="#F8FAFC" stroke="#0F172A" strokeWidth="1.5" />
        <path d="M9 28L32 10L55 28" stroke="#EF4444" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <polygon points="14,26 32,12 50,26" fill="#FCA5A5" />
        <rect x="16" y="31" width="10" height="8" rx="1" fill="#38BDF8" stroke="#0F172A" strokeWidth="1.5" />
        <rect x="38" y="31" width="10" height="8" rx="1" fill="#38BDF8" stroke="#0F172A" strokeWidth="1.5" />
        <rect x="27" y="44" width="10" height="12" fill="#E2E8F0" stroke="#0F172A" strokeWidth="1.5" />
        <circle cx="34" cy="50" r="1" fill="#0F172A" />
        <rect x="16" y="45" width="7" height="9" fill="#FDE047" stroke="#0F172A" strokeWidth="1.5" />
        <rect x="41" y="45" width="7" height="9" fill="#FDE047" stroke="#0F172A" strokeWidth="1.5" />
        <rect x="8" y="56" width="48" height="3" fill="#64748B" />
      </svg>
    );
  }

  // 7. WATER SUPPLY TO EACH PLOT / WATER TAP / PIPELINE
  if (t.includes('water supply') || t.includes('tap') || t.includes('drinking water') || (t.includes('water') && !t.includes('tank'))) {
    return (
      <svg width="100%" height="100%" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="8" y="28" width="22" height="7" rx="2" fill="#64748B" stroke="#334155" strokeWidth="1.5" />
        <rect x="18" y="20" width="6" height="9" fill="#94A3B8" stroke="#334155" strokeWidth="1.5" />
        <ellipse cx="21" cy="19" rx="8" ry="3.5" fill="#EF4444" stroke="#B91C1C" strokeWidth="1.5" />
        <path d="M30 31.5H38C40.2091 31.5 42 33.2909 42 35.5V40H35V36.5C35 35.6716 34.3284 35 33.5 35H30V31.5Z" fill="#94A3B8" stroke="#334155" strokeWidth="1.5" />
        <path d="M47 41C47 41 53 48 53 52C53 55.3137 50.3137 58 47 58C43.6863 58 41 55.3137 41 52C41 48 47 41 47 41Z" fill="#0EA5E9" stroke="#0284C7" strokeWidth="1.5" />
        <ellipse cx="45" cy="51" rx="2" ry="3" fill="#BAE6FD" />
        <path d="M34 45L36 50M38 43L40 48" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  // 8. COMPOUND WALL / BRICK WALL / PERIMETER
  if (t.includes('compound') || t.includes('wall') || t.includes('boundary') || t.includes('perimeter')) {
    return (
      <svg width="100%" height="100%" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="8" y="16" width="48" height="38" rx="2" fill="#FEF08A" stroke="#EAB308" strokeWidth="2" />
        <line x1="8" y1="28" x2="56" y2="28" stroke="#EAB308" strokeWidth="2" />
        <line x1="8" y1="41" x2="56" y2="41" stroke="#EAB308" strokeWidth="2" />
        <line x1="24" y1="16" x2="24" y2="28" stroke="#EAB308" strokeWidth="2" />
        <line x1="40" y1="16" x2="40" y2="28" stroke="#EAB308" strokeWidth="2" />
        <line x1="16" y1="28" x2="16" y2="41" stroke="#EAB308" strokeWidth="2" />
        <line x1="32" y1="28" x2="32" y2="41" stroke="#EAB308" strokeWidth="2" />
        <line x1="48" y1="28" x2="48" y2="41" stroke="#EAB308" strokeWidth="2" />
        <line x1="24" y1="41" x2="24" y2="54" stroke="#EAB308" strokeWidth="2" />
        <line x1="40" y1="41" x2="40" y2="54" stroke="#EAB308" strokeWidth="2" />
        <rect x="6" y="13" width="52" height="4" rx="1.5" fill="#CA8A04" />
      </svg>
    );
  }

  // 9. 24/7 SECURITY / CCTV / GUARD
  if (t.includes('security') || t.includes('guard') || t.includes('cctv') || t.includes('surveillance')) {
    return (
      <svg width="100%" height="100%" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="32" cy="18" rx="15" ry="5" fill="#1E3A8A" />
        <path d="M20 18C20 18 22 10 32 10C42 10 44 18 44 18H20Z" fill="#1E40AF" />
        <circle cx="32" cy="14" r="2.5" fill="#FACC15" />
        <circle cx="32" cy="28" r="10" fill="#FED7AA" stroke="#EA580C" strokeWidth="1.5" />
        <ellipse cx="28" cy="27" rx="1.5" ry="2" fill="#0F172A" />
        <ellipse cx="36" cy="27" rx="1.5" ry="2" fill="#0F172A" />
        <path d="M30 33C31 34 33 34 34 33" stroke="#EA580C" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M16 56C16 46 22 41 32 41C42 41 48 46 48 56" fill="#2563EB" stroke="#1D4ED8" strokeWidth="1.5" />
        <polygon points="32,41 29,48 35,48" fill="#FACC15" />
        <rect x="23" y="44" width="4" height="12" fill="#FEF08A" />
        <rect x="37" y="44" width="4" height="12" fill="#FEF08A" />
        <circle cx="39" cy="46" r="2" fill="#FACC15" />
      </svg>
    );
  }

  // 10. OVERHEAD WATER TANK / TANK
  if (t.includes('overhead') || t.includes('tank') || t.includes('reservoir')) {
    return (
      <svg width="100%" height="100%" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="32" cy="18" rx="14" ry="5" fill="#38BDF8" stroke="#0284C7" strokeWidth="1.5" />
        <path d="M18 18V28C18 31 24 33 32 33C40 33 46 31 46 28V18" fill="#0EA5E9" stroke="#0284C7" strokeWidth="1.5" />
        <ellipse cx="32" cy="28" rx="14" ry="4.5" fill="#0284C7" opacity="0.3" />
        <line x1="21" y1="33" x2="16" y2="56" stroke="#0284C7" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="43" y1="33" x2="48" y2="56" stroke="#0284C7" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="26" y1="33" x2="24" y2="56" stroke="#0284C7" strokeWidth="2" strokeLinecap="round" />
        <line x1="38" y1="33" x2="40" y2="56" stroke="#0284C7" strokeWidth="2" strokeLinecap="round" />
        <line x1="18" y1="41" x2="46" y2="41" stroke="#0284C7" strokeWidth="1.5" />
        <line x1="17" y1="48" x2="47" y2="48" stroke="#0284C7" strokeWidth="1.5" />
        <rect x="14" y="55" width="36" height="3" rx="1" fill="#64748B" />
      </svg>
    );
  }

  // 11. UNDERGROUND DRAINAGE / DRAIN / SEWAGE
  if (t.includes('drainage') || t.includes('under ground') || t.includes('underground') || t.includes('sewage') || t.includes('pipe')) {
    return (
      <svg width="100%" height="100%" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="8" y="24" width="22" height="18" rx="2" fill="#CBD5E1" stroke="#64748B" strokeWidth="1.5" />
        <ellipse cx="30" cy="33" rx="4" ry="9" fill="#94A3B8" stroke="#64748B" strokeWidth="1.5" />
        <path d="M30 33C33 33 36 38 42 38C48 38 52 35 56 35V52H24V42C28 42 28 33 30 33Z" fill="#38BDF8" opacity="0.65" />
        <path d="M30 36C35 36 38 41 44 41C50 41 53 38 58 38" stroke="#0284C7" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M26 43C31 43 35 48 42 48C48 48 52 45 56 45" stroke="#0284C7" strokeWidth="2" strokeLinecap="round" />
        <circle cx="48" cy="48" r="2" fill="#BAE6FD" />
        <circle cx="53" cy="42" r="1.5" fill="#BAE6FD" />
      </svg>
    );
  }

  // 12. ENTIRE LAYOUT AS PER VASTU / VAASTU / COMPASS
  if (t.includes('vastu') || t.includes('vaastu') || t.includes('compass') || t.includes('orientation')) {
    return (
      <svg width="100%" height="100%" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="32" cy="32" r="24" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2.5" />
        <circle cx="32" cy="32" r="19" stroke="#E2E8F0" strokeWidth="1.5" strokeDasharray="2 2" />
        <polygon points="32,13 36,32 32,32 28,32" fill="#EF4444" stroke="#DC2626" strokeWidth="1" />
        <polygon points="32,51 36,32 32,32 28,32" fill="#2563EB" stroke="#1D4ED8" strokeWidth="1" />
        <circle cx="32" cy="32" r="3.5" fill="#0F172A" />
        <circle cx="32" cy="32" r="1.5" fill="#FFFFFF" />
        <text x="32" y="10" fontFamily="sans-serif" fontSize="7" fontWeight="bold" fill="#EF4444" textAnchor="middle">N</text>
        <text x="32" y="60" fontFamily="sans-serif" fontSize="7" fontWeight="bold" fill="#2563EB" textAnchor="middle">S</text>
        <text x="59" y="34.5" fontFamily="sans-serif" fontSize="7" fontWeight="bold" fill="#0F172A" textAnchor="middle">E</text>
        <text x="5" y="34.5" fontFamily="sans-serif" fontSize="7" fontWeight="bold" fill="#0F172A" textAnchor="middle">W</text>
      </svg>
    );
  }

  // 13. CLEAR TITLE & SPOT REGISTRATION / DOCUMENT / LEGAL
  if (t.includes('title') || t.includes('registration') || t.includes('clear') || t.includes('deed') || t.includes('certificate')) {
    return (
      <svg width="100%" height="100%" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="14" y="10" width="36" height="46" rx="3" fill="#FFFFFF" stroke="#38BDF8" strokeWidth="2" />
        <rect x="18" y="14" width="28" height="6" rx="1.5" fill="#38BDF8" />
        <rect x="18" y="24" width="10" height="12" rx="1" fill="#FDE047" stroke="#CA8A04" strokeWidth="1" />
        <line x1="32" y1="26" x2="44" y2="26" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
        <line x1="32" y1="32" x2="44" y2="32" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
        <line x1="18" y1="41" x2="44" y2="41" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="18" y1="46" x2="36" y2="46" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M35 52L49 32L53 36L39 56L35 56L35 52Z" fill="#FACC15" stroke="#CA8A04" strokeWidth="1" />
        <polygon points="35,52 35,56 39,56" fill="#EF4444" />
      </svg>
    );
  }

  // 14. SOLAR FENCING / SOLAR / ECO PROTECTION
  if (t.includes('solar') || t.includes('fencing') || t.includes('fence') || t.includes('eco')) {
    return (
      <svg width="100%" height="100%" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="32" cy="27" r="15" fill="#38BDF8" stroke="#0284C7" strokeWidth="1.5" />
        <path d="M22 24C24 20 28 19 32 20C35 21 38 24 37 28C36 31 33 33 30 35C27 33 22 28 22 24Z" fill="#22C55E" />
        <path d="M34 16C36 17 38 19 39 21C42 22 45 25 44 28C43 30 41 31 39 31" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" />
        <path d="M12 42C14 36 21 34 26 36L32 39L38 36C43 34 50 36 52 42C53 46 51 51 46 54L32 58L18 54C13 51 11 46 12 42Z" fill="#FBBF24" stroke="#D97706" strokeWidth="1.5" />
        <path d="M20 48L32 54L44 48" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  // 15. BLACKTOP ROADS / BT ROADS / WIDE AVENUES / HIGHWAY
  if (t.includes('road') || t.includes('avenue') || t.includes('tar') || t.includes('bt') || t.includes('highway')) {
    return (
      <svg width="100%" height="100%" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <polygon points="12,54 22,14 42,14 52,54" fill="#334155" stroke="#1E293B" strokeWidth="1.5" />
        <line x1="32" y1="16" x2="32" y2="24" stroke="#FBBF24" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="32" y1="29" x2="32" y2="39" stroke="#FBBF24" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="32" y1="44" x2="32" y2="52" stroke="#FBBF24" strokeWidth="2.5" strokeLinecap="round" />
        <polygon points="6,54 18,14 22,14 12,54" fill="#22C55E" />
        <polygon points="52,54 42,14 46,14 58,54" fill="#22C55E" />
      </svg>
    );
  }

  // 16. SWIMMING POOL / POOL / CLUBHOUSE
  if (t.includes('pool') || t.includes('swim')) {
    return (
      <svg width="100%" height="100%" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="22" width="44" height="32" rx="4" fill="#38BDF8" stroke="#0284C7" strokeWidth="2" />
        <path d="M12 32C16 30 20 34 24 32C28 30 32 34 36 32C40 30 44 34 48 32C50 31 51 32 52 32" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
        <path d="M12 42C16 40 20 44 24 42C28 40 32 44 36 42C40 40 44 44 48 42C50 41 51 42 52 42" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
        <rect x="18" y="12" width="4" height="24" rx="2" fill="#E2E8F0" stroke="#64748B" strokeWidth="1" />
        <rect x="26" y="12" width="4" height="24" rx="2" fill="#E2E8F0" stroke="#64748B" strokeWidth="1" />
        <line x1="20" y1="18" x2="28" y2="18" stroke="#64748B" strokeWidth="2" />
        <line x1="20" y1="24" x2="28" y2="24" stroke="#64748B" strokeWidth="2" />
      </svg>
    );
  }

  // 17. CLUBHOUSE / INDOOR GAMES
  if (t.includes('clubhouse') || t.includes('club') || t.includes('community')) {
    return (
      <svg width="100%" height="100%" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 26L32 10L56 26" stroke="#991B1B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <polygon points="12,25 32,12 52,25" fill="#F87171" />
        <rect x="14" y="26" width="36" height="28" fill="#F8FAFC" stroke="#334155" strokeWidth="1.5" />
        <rect x="18" y="30" width="4" height="20" fill="#E2E8F0" />
        <rect x="26" y="30" width="4" height="20" fill="#E2E8F0" />
        <rect x="34" y="30" width="4" height="20" fill="#E2E8F0" />
        <rect x="42" y="30" width="4" height="20" fill="#E2E8F0" />
        <rect x="28" y="40" width="8" height="14" fill="#0F172A" />
      </svg>
    );
  }

  // DEFAULT / GENERAL PREMIUM AMENITY CREST
  return (
    <svg width="100%" height="100%" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="22" fill="#FEF08A" stroke="#EAB308" strokeWidth="2" />
      <polygon points="32,16 36,26 47,27 39,35 41,46 32,40 23,46 25,35 17,27 28,26" fill="#F59E0B" stroke="#D97706" strokeWidth="1" />
    </svg>
  );
}

export default function AmenitiesSection({ venture }: AmenitiesSectionProps) {
  const sectionTitle = venture.amenitiesTitle || 'PREMIUM PLOTS WITH WORLD CLASS AMENITIES';

  // Use dynamically configured venture amenities, or the 15 standard verified amenities
  const amenitiesList = useMemo<AmenityItem[]>(() => {
    if (Array.isArray(venture.amenities) && venture.amenities.length > 0) {
      return venture.amenities;
    }
    return [
      { id: 1, title: 'GRAND ENTRANCE ARCH', category: 'Architecture' },
      { id: 2, title: 'UNDERGROUND ELECTRICITY CONNECTION', category: 'Utilities' },
      { id: 3, title: 'AVENUE PLANTATION', category: 'Landscape' },
      { id: 4, title: 'STREET LIGHTS', category: 'Utilities' },
      { id: 5, title: 'CHILDREN PARK', category: 'Recreation' },
      { id: 6, title: 'DUPLEX VILLA', category: 'Architecture' },
      { id: 7, title: 'WATER SUPPLY TO EACH PLOT', category: 'Utilities' },
      { id: 8, title: 'COMPOUND WALL', category: 'Security' },
      { id: 9, title: '24/7 SECURITY', category: 'Security' },
      { id: 10, title: 'OVERHEAD WATER TANK', category: 'Utilities' },
      { id: 11, title: 'UNDERGROUND DRAINAGE', category: 'Utilities' },
      { id: 12, title: 'ENTIRE LAYOUT AS PER VASTU', category: 'Planning' },
      { id: 13, title: 'CLEAR TITLE & SPOT REGISTRATION', category: 'Legal' },
      { id: 14, title: 'SOLAR FENCING ENTIRE LAYOUT', category: 'Security' },
      { id: 15, title: 'WATER SUPPLY TO EACH PLOT', category: 'Utilities' },
    ];
  }, [venture.amenities]);

  return (
    <section
      id="amenities"
      className="py-16 sm:py-20 md:py-24 bg-white border-b border-zinc-200/80 relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ===================== CENTERED HEADER ===================== */}
        <div className="text-center mb-10 sm:mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black font-serif tracking-tight text-[#8B1D2C] uppercase leading-tight">
            {sectionTitle}
          </h2>
        </div>

        {/* ===================== 4-COLUMN AMENITIES GRID ===================== */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 sm:gap-x-8 md:gap-x-10 gap-y-10 sm:gap-y-12 max-w-5xl mx-auto items-start">
          {amenitiesList.map((item, idx) => (
            <div
              key={item.id || idx}
              className="flex flex-col items-center text-center cursor-pointer transition-transform duration-300 ease-out hover:-translate-y-1.5 group select-none"
            >
              {/* Graphic Icon / Image Container (Exact dimensions matching Theme 3: 80px to 115px) */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-[105px] md:h-[105px] lg:w-[115px] lg:h-[115px] flex items-center justify-center p-2 sm:p-2.5 rounded-2xl bg-slate-50/70 border border-slate-200/70 shadow-xs transition-all duration-300 group-hover:scale-105 group-hover:shadow-md">
                {item.image || item.iconImage ? (
                  <img
                    src={item.image || item.iconImage}
                    alt={item.title}
                    className="w-full h-full object-contain rounded-xl block"
                  />
                ) : (
                  renderAmenitySvg(item.title, item.category)
                )}
              </div>

              {/* Bold Uppercase Amenity Title */}
              <span className="mt-3.5 text-xs sm:text-[13px] md:text-sm font-extrabold tracking-wide uppercase text-slate-700 group-hover:text-slate-950 transition-colors line-clamp-2 max-w-[200px] leading-snug">
                {item.title}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
