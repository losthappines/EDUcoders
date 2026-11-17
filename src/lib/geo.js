// GPS & territorial distance matching utilities for OnaCare Uzbekistan

const REGION_COORDS = {
  "Toshkent shahri": { lat: 41.3111, lng: 69.2797 },
  "Toshkent viloyati": { lat: 41.0058, lng: 69.1235 },
  "Namangan viloyati": { lat: 41.0011, lng: 71.6726 },
  "Samarqand viloyati": { lat: 39.6542, lng: 66.9597 },
  "Andijon viloyati": { lat: 40.7821, lng: 72.3442 },
  "Farg'ona viloyati": { lat: 40.3864, lng: 71.7864 },
  "Buxoro viloyati": { lat: 39.7747, lng: 64.4286 },
  "Qashqadaryo viloyati": { lat: 38.8612, lng: 65.7847 },
  "Surxondaryo viloyati": { lat: 37.2242, lng: 67.2783 },
  "Jizzax viloyati": { lat: 40.1158, lng: 67.8422 },
  "Sirdaryo viloyati": { lat: 40.4897, lng: 68.7842 },
  "Navoiy viloyati": { lat: 40.0844, lng: 65.3792 },
  "Xorazm viloyati": { lat: 41.55, lng: 60.6333 },
  "Qoraqalpog'iston Respublikasi": { lat: 42.4602, lng: 59.6156 },
};

const DISTRICT_COORDS = {
  yunusobod: { lat: 41.3667, lng: 69.2869 },
  chilonzor: { lat: 41.2753, lng: 69.2036 },
  "mirzo ulug'bek": { lat: 41.3266, lng: 69.3422 },
  shayxontohur: { lat: 41.3228, lng: 69.2392 },
  olmazor: { lat: 41.3519, lng: 69.2167 },
  yakkasaroy: { lat: 41.2836, lng: 69.2572 },
  mirobod: { lat: 41.2889, lng: 69.2817 },
  sergeli: { lat: 41.2242, lng: 69.2175 },
  uchtepa: { lat: 41.2883, lng: 69.1753 },
  yashnobod: { lat: 41.2981, lng: 69.3358 },
  bektemir: { lat: 41.2094, lng: 69.3342 },
  yangihayot: { lat: 41.2133, lng: 69.1939 },
  davlatobod: { lat: 41.0085, lng: 71.6083 },
  "namangan shahri": { lat: 40.9983, lng: 71.6726 },
  "yangi namangan": { lat: 41.0241, lng: 71.6625 },
  "samarqand shahri": { lat: 39.6542, lng: 66.9597 },
  "andijon shahri": { lat: 40.7821, lng: 72.3442 },
  "farg'ona shahri": { lat: 40.3864, lng: 71.7864 },
  "buxoro shahri": { lat: 39.7747, lng: 64.4286 },
};

export function resolveCoordinatesForLocation(district = "", region = "") {
  const distLower = String(district || "").toLowerCase();
  for (const [key, coords] of Object.entries(DISTRICT_COORDS)) {
    if (distLower.includes(key)) {
      return { latitude: coords.lat, longitude: coords.lng };
    }
  }
  const regLower = String(region || "").toLowerCase();
  for (const [regName, coords] of Object.entries(REGION_COORDS)) {
    const base = regName.toLowerCase().split(" ")[0];
    if (regLower.includes(base) || distLower.includes(base)) {
      return { latitude: coords.lat, longitude: coords.lng };
    }
  }
  // Tashkent default center
  return { latitude: 41.3111, longitude: 69.2797 };
}

export function haversineDistanceKm(lat1, lng1, lat2, lng2) {
  if (
    typeof lat1 !== "number" ||
    typeof lng1 !== "number" ||
    typeof lat2 !== "number" ||
    typeof lng2 !== "number" ||
    Number.isNaN(lat1) ||
    Number.isNaN(lng1) ||
    Number.isNaN(lat2) ||
    Number.isNaN(lng2)
  ) {
    return null;
  }
  const R = 6371;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

const CATEGORY_KEYWORDS = {
  POSTPARTUM: ["akusher", "ginekolog", "ob", "postpartum", "tug'ruq", "ona", "patronaj", "oilaviy"],
  CARDIO: ["kardio", "qon bosim", "terapevt", "oilaviy", "cardio"],
  PEDIATRIC: ["pediatr", "neonatolog", "chaqaloq", "bola", "patronaj"],
  EMERGENCY: ["tez", "shoshilinch", "emergency", "akusher", "oilaviy"],
  GENERAL: ["oilaviy", "terapevt", "umumiy", "family", "hamshira"],
  OTHER: ["oilaviy", "terapevt", "umumiy"],
};

export function matchNearestDoctor(doctors, params) {
  const verifiedDoctors = (doctors || []).filter(
    (d) =>
      (d.role === "FAMILY_MD" || d.role === "OVABMU_MD") &&
      (d.verificationStatus === undefined || d.verificationStatus === "VERIFIED")
  );
  if (verifiedDoctors.length === 0) {
    return { doctor: null, distanceKm: null };
  }

  const pLat = typeof params.latitude === "number" ? params.latitude : null;
  const pLng = typeof params.longitude === "number" ? params.longitude : null;
  const pDist = String(params.district || "").toLowerCase();
  const keywords = CATEGORY_KEYWORDS[params.category || "POSTPARTUM"] || CATEGORY_KEYWORDS.GENERAL;

  const scored = verifiedDoctors.map((doc) => {
    const docCoords =
      typeof doc.latitude === "number" && typeof doc.longitude === "number"
        ? { latitude: doc.latitude, longitude: doc.longitude }
        : resolveCoordinatesForLocation(doc.district || "", "");

    const distKm =
      pLat !== null && pLng !== null
        ? haversineDistanceKm(pLat, pLng, docCoords.latitude, docCoords.longitude)
        : null;

    const specText = `${doc.expertiseArea || ""} ${doc.specialty || ""}`.toLowerCase();
    const specMatch = keywords.some((kw) => specText.includes(kw)) ? 1 : 0;
    const districtMatch =
      pDist && doc.district && doc.district.toLowerCase().includes(pDist.split(",")[0].trim())
        ? 1
        : 0;
    const isFamilyFirst = doc.role === "FAMILY_MD" ? 1 : 0;
    const hasActiveSub = doc.subscriptionStatus === "ACTIVE" ? 1 : 0;

    // Lower penalty score wins
    let rankScore = distKm !== null ? distKm : 25;
    if (districtMatch) rankScore -= 5;
    if (specMatch) rankScore -= 4;
    if (isFamilyFirst) rankScore -= 2;
    if (hasActiveSub) rankScore -= 1;

    return { doctor: doc, distanceKm: distKm, rankScore };
  });

  scored.sort((a, b) => a.rankScore - b.rankScore);
  return {
    doctor: scored[0].doctor,
    distanceKm: scored[0].distanceKm,
  };
}

export const VISIT_DESTINATION_OPTIONS = [
  {
    value: "HOME",
    uz: "Uy manzilim",
    ru: "Мой домашний адрес",
    en: "My Home Address",
  },
  {
    value: "CURRENT_GPS",
    uz: "Hozirgi GPS joylashuvim",
    ru: "Моя текущая GPS-локация",
    en: "My Current GPS Location",
  },
  {
    value: "RELATIVE_HOME",
    uz: "Yaqinlarim / Ota-ona uyi",
    ru: "Дом родных / родителей",
    en: "Relative's / Parents' Home",
  },
  {
    value: "CLINIC",
    uz: "Poliklinika qabuli",
    ru: "Прием в поликлинике",
    en: "Meet at Polyclinic",
  },
  {
    value: "CUSTOM",
    uz: "Boshqa aniq manzil",
    ru: "Другой точный адрес",
    en: "Other Specific Address",
  },
];
