export interface UzDistrict {
  name: string;
  mahallas: string[];
}

export interface UzRegion {
  name: string;
  polyclinicPrefix: string;
  districts: UzDistrict[];
}

export interface BloodTypeOption {
  value: string;
  labelEn: string;
  labelUz: string;
  labelRu: string;
}

export const BLOOD_TYPE_OPTIONS: BloodTypeOption[] = [
  { value: "O(I) Rh+", labelEn: "O(I) Rh+ (O positive)", labelUz: "O(I) Rh+ (I guruh musbat)", labelRu: "O(I) Rh+ (I группа положительная)" },
  { value: "O(I) Rh-", labelEn: "O(I) Rh- (O negative)", labelUz: "O(I) Rh- (I guruh manfiy)", labelRu: "O(I) Rh- (I группа отрицательная)" },
  { value: "A(II) Rh+", labelEn: "A(II) Rh+ (A positive)", labelUz: "A(II) Rh+ (II guruh musbat)", labelRu: "A(II) Rh+ (II группа положительная)" },
  { value: "A(II) Rh-", labelEn: "A(II) Rh- (A negative)", labelUz: "A(II) Rh- (II guruh manfiy)", labelRu: "A(II) Rh- (II группа отрицательная)" },
  { value: "B(III) Rh+", labelEn: "B(III) Rh+ (B positive)", labelUz: "B(III) Rh+ (III guruh musbat)", labelRu: "B(III) Rh+ (III группа положительная)" },
  { value: "B(III) Rh-", labelEn: "B(III) Rh- (B negative)", labelUz: "B(III) Rh- (III guruh manfiy)", labelRu: "B(III) Rh- (III группа отрицательная)" },
  { value: "AB(IV) Rh+", labelEn: "AB(IV) Rh+ (AB positive)", labelUz: "AB(IV) Rh+ (IV guruh musbat)", labelRu: "AB(IV) Rh+ (IV группа положительная)" },
  { value: "AB(IV) Rh-", labelEn: "AB(IV) Rh- (AB negative)", labelUz: "AB(IV) Rh- (IV guruh manfiy)", labelRu: "AB(IV) Rh- (IV группа отрицательная)" },
  { value: "I don't know", labelEn: "I don't know", labelUz: "Bilmayman (aniqlanmagan)", labelRu: "Не знаю" },
];

export const UZ_REGIONS: UzRegion[] = [
  {
    name: "Toshkent shahri",
    polyclinicPrefix: "TSH",
    districts: [
      { name: "Yunusobod", mahallas: ["Bog'ishamol MFY", "Minor MFY", "Ahmad Donish MFY", "Bodomzor MFY", "Yunusobod-11 MFY", "Turkiston MFY"] },
      { name: "Chilonzor", mahallas: ["Qatortol MFY", "Do'mbirobod MFY", "Chilonzor-7 MFY", "Novza MFY", "Lutfiy MFY", "Katta Qozirabot MFY"] },
      { name: "Mirzo Ulug'bek", mahallas: ["Buyuk Ipak Yo'li MFY", "Hamid Olimjon MFY", "Qorasuv-1 MFY", "Feruza MFY", "Alisher Navoiy MFY"] },
      { name: "Shayxontohur", mahallas: ["Chorsu MFY", "Koh Ota MFY", "Xadra MFY", "Labzak MFY", "Janggoh MFY"] },
      { name: "Olmazor", mahallas: ["Qoraqamish-1 MFY", "Beruniy MFY", "Sebzor MFY", "Sag'bon MFY", "Chig'atoy MFY"] },
      { name: "Yakkasaroy", mahallas: ["Bobur MFY", "Shota Rustaveli MFY", "Rakat MFY", "Boshliq MFY", "Muqimiy MFY"] },
      { name: "Mirobod", mahallas: ["Oybek MFY", "Ming O'rik MFY", "Qo'yliq-1 MFY", "Farg'ona Yo'li MFY", "Movarounnahr MFY"] },
      { name: "Sergeli", mahallas: ["Sergeli-5 MFY", "Qipchoq MFY", "Do'stlik MFY", "Nilufar MFY", "Choshtepa MFY"] },
      { name: "Uchtepa", mahallas: ["Katta Qa'ni MFY", "Beshqayrag'och MFY", "Lutfiy MFY", "Foziltepa MFY", "Bog'obod MFY"] },
      { name: "Yashnobod", mahallas: ["Aviasozlar MFY", "Tuzel MFY", "Do'stobod MFY", "Ohangaron MFY", "Birlashgan MFY"] },
      { name: "Bektemir", mahallas: ["Husayn Boyqaro MFY", "Rohat MFY", "Suvsoz MFY", "Zilola MFY"] },
      { name: "Yangihayot", mahallas: ["Sputnik MFY", "Yangi Choshtepa MFY", "Chortoq MFY", "Gulshanobod MFY"] },
    ],
  },
  {
    name: "Namangan viloyati",
    polyclinicPrefix: "NAM",
    districts: [
      { name: "Davlatobod", mahallas: ["Yuksalish MFY", "Guliston MFY", "Orzu MFY", "Porloq MFY", "Yangi Tong MFY"] },
      { name: "Namangan shahri", mahallas: ["Bobur MFY", "Chorsu MFY", "G'ishtko'prik MFY", "Axsikent MFY", "Barkamol Avlod MFY"] },
      { name: "Yangi Namangan", mahallas: ["Go'zal MFY", "Chamanzor MFY", "Bunyodkor MFY", "Sherbuloq MFY"] },
      { name: "Chust", mahallas: ["Chust Markaziy MFY", "G'ova MFY", "Varzik MFY", "Olmos MFY"] },
      { name: "Pop", mahallas: ["Pop Markaziy MFY", "Chorkesar MFY", "Sang MFY", "Pungon MFY"] },
      { name: "Chortoq", mahallas: ["Chortoq MFY", "Baliqli Ko'l MFY", "Peshaq MFY", "Koroskon MFY"] },
      { name: "Kosonsoy", mahallas: ["Kosonsoy MFY", "Ravot MFY", "Tergachi MFY", "Chindovul MFY"] },
      { name: "To'raqo'rg'on", mahallas: ["Axsi MFY", "Shohidon MFY", "Yortepa MFY", "Buramatut MFY"] },
      { name: "Uychi", mahallas: ["Uychi MFY", "Jiydakapa MFY", "Yorkatay MFY", "Mashad MFY"] },
      { name: "Uchqo'rg'on", mahallas: ["Uchqo'rg'on MFY", "Qayqi MFY", "Norinkapa MFY"] },
      { name: "Mingbuloq", mahallas: ["Jomasho'y MFY", "Gur-tepa MFY", "Mehnatobod MFY"] },
      { name: "Norin", mahallas: ["Haqqulobod MFY", "Xo'jaobod MFY", "Shohariq MFY"] },
      { name: "Yangiqo'rg'on", mahallas: ["Yangiqo'rg'on MFY", "Nanay MFY", "Zarkent MFY"] },
    ],
  },
  {
    name: "Toshkent viloyati",
    polyclinicPrefix: "TVL",
    districts: [
      { name: "Nurafshon shahri", mahallas: ["Nurafshon Markaziy MFY", "To'ytepa MFY", "Yangi Hayot MFY"] },
      { name: "Chirchiq shahri", mahallas: ["Troitskiy MFY", "G'alaba MFY", "Sharq MFY", "Yubileyniy MFY"] },
      { name: "Olmaliq shahri", mahallas: ["Metallurg MFY", "Oydin MFY", "Bobur MFY", "Do'stlik MFY"] },
      { name: "Angren shahri", mahallas: ["Dukent MFY", "Yangiobod MFY", "G'oliblar MFY"] },
      { name: "Zangiota", mahallas: ["Eshonguzar MFY", "Nazarbek MFY", "Keles MFY", "Tarnov MFY"] },
      { name: "Qibray", mahallas: ["Qibray MFY", "Baytqo'rg'on MFY", "Do'rmon MFY", "Salar MFY"] },
      { name: "Toshkent tumani", mahallas: ["Keles MFY", "Hasanboy MFY", "Chuvalachi MFY"] },
      { name: "Yangiyo'l", mahallas: ["Yangiyo'l Markaziy MFY", "Niyozbosh MFY", "Gulbahor MFY"] },
      { name: "Bo'stonliq", mahallas: ["G'azalkent MFY", "Chorvoq MFY", "Xojikent MFY"] },
      { name: "Parkent", mahallas: ["Parkent MFY", "So'qoq MFY", "Kumushkon MFY"] },
      { name: "Bekobod", mahallas: ["Bekobod MFY", "Zafar MFY", "Dalvarzin MFY"] },
      { name: "Oqqo'rg'on", mahallas: ["Oqqo'rg'on MFY", "Olimkent MFY"] },
    ],
  },
  {
    name: "Samarqand viloyati",
    polyclinicPrefix: "SAM",
    districts: [
      { name: "Samarqand shahri", mahallas: ["Registon MFY", "Siyob MFY", "Sartepo MFY", "So'g'diyona MFY", "Temiryo'l MFY"] },
      { name: "Kattaqo'rg'on shahri", mahallas: ["Chinobod MFY", "Ingichka MFY", "Alisher Navoiy MFY"] },
      { name: "Urgut", mahallas: ["Urgut Markaziy MFY", "Jartepa MFY", "G'o's MFY", "Qoratepa MFY"] },
      { name: "Pastdarg'om", mahallas: ["Juma MFY", "Charxin MFY", "Go'zalkent MFY"] },
      { name: "Oqdaryo", mahallas: ["Loyish MFY", "Dahbed MFY", "Kumushkent MFY"] },
      { name: "Toyloq", mahallas: ["Toyloq MFY", "Bog'izog'on MFY", "Chorbog'tepa MFY"] },
      { name: "Bulung'ur", mahallas: ["Bulung'ur MFY", "Kildon MFY", "Fozil Yo'ldosh MFY"] },
      { name: "Jomboy", mahallas: ["Jomboy MFY", "Qang'li MFY", "G'azira MFY"] },
      { name: "Payariq", mahallas: ["Payariq MFY", "Chelak MFY", "Imom al-Buxoriy MFY"] },
      { name: "Ishtixon", mahallas: ["Ishtixon MFY", "Mitan MFY", "Xonaqo MFY"] },
      { name: "Narpay", mahallas: ["Oqtosh MFY", "Mirbozor MFY", "Islom Shoir MFY"] },
    ],
  },
  {
    name: "Andijon viloyati",
    polyclinicPrefix: "AND",
    districts: [
      { name: "Andijon shahri", mahallas: ["Boburshoh MFY", "Eski Shahar MFY", "Klisim MFY", "Yangi Bozor MFY", "Bog'ishamol MFY"] },
      { name: "Asaka", mahallas: ["Asaka Markaziy MFY", "Kujgan MFY", "Niyozbotir MFY", "Qadim MFY"] },
      { name: "Shahrixon", mahallas: ["Shahrixon MFY", "Segazaqum MFY", "Nazarmaxram MFY"] },
      { name: "Xonobod shahri", mahallas: ["Xonobod MFY", "Kampirovot MFY", "Teyit MFY"] },
      { name: "Baliqchi", mahallas: ["Baliqchi MFY", "Chinobod MFY", "Olimbek MFY"] },
      { name: "Oltinko'l", mahallas: ["Oltinko'l MFY", "Ko'makay MFY", "Qo'shtepasaroy MFY"] },
      { name: "Marhamat", mahallas: ["Marhamat MFY", "Polvontosh MFY", "Mingtepa MFY"] },
      { name: "Xo'jaobod", mahallas: ["Xo'jaobod MFY", "Imom Ota MFY", "Manak MFY"] },
      { name: "Paxtaobod", mahallas: ["Paxtaobod MFY", "Madaniyat MFY", "Uyg'ur MFY"] },
      { name: "Qo'rg'ontepa", mahallas: ["Qo'rg'ontepa MFY", "Qorasuv MFY", "Dardoq MFY"] },
    ],
  },
  {
    name: "Farg'ona viloyati",
    polyclinicPrefix: "FAR",
    districts: [
      { name: "Farg'ona shahri", mahallas: ["Al-Farg'oniy MFY", "Qirguli MFY", "Mustaqillik MFY", "Jo'ydam MFY", "Yormozor MFY"] },
      { name: "Marg'ilon shahri", mahallas: ["Yodgorlik MFY", "Zuhro MFY", "Chilonzor MFY", "Toshloqtepa MFY"] },
      { name: "Qo'qon shahri", mahallas: ["Xudoyorxon MFY", "Degrezlik MFY", "Muqimiy MFY", "Qaymoqbozor MFY"] },
      { name: "Quvasoy shahri", mahallas: ["Arsif MFY", "Valik MFY", "Muyan MFY"] },
      { name: "Rishton", mahallas: ["Rishton Markaziy MFY", "Zoxidon MFY", "Oqyer MFY"] },
      { name: "Oltiariq", mahallas: ["Oltiariq MFY", "Poloson MFY", "Tinchlik MFY"] },
      { name: "Beshariq", mahallas: ["Beshariq MFY", "Rapqon MFY", "Vorux Dasht MFY"] },
      { name: "Bag'dod", mahallas: ["Bag'dod MFY", "Samarqand MFY", "Qo'shtegirmon MFY"] },
      { name: "Uchko'prik", mahallas: ["Uchko'prik MFY", "Kenagas MFY", "Mehnatobod MFY"] },
      { name: "Quva", mahallas: ["Quva MFY", "Qayrag'och MFY", "Akbarobod MFY"] },
    ],
  },
  {
    name: "Buxoro viloyati",
    polyclinicPrefix: "BUX",
    districts: [
      { name: "Buxoro shahri", mahallas: ["Labi Hovuz MFY", "Bahouddin Naqshband MFY", "Somoniy MFY", "Sharq-1 MFY", "Xo'ja G'unjori MFY"] },
      { name: "Kogon shahri", mahallas: ["Temiryo'lchi MFY", "Zirabod MFY", "Nurafshon MFY"] },
      { name: "G'ijduvon", mahallas: ["G'ijduvon MFY", "Zarangari MFY", "Soktari MFY"] },
      { name: "Vobkent", mahallas: ["Vobkent MFY", "Kumushkent MFY", "Xayrabod MFY"] },
      { name: "Romitan", mahallas: ["Romitan MFY", "Gazli MFY", "Qizilravot MFY"] },
      { name: "Jondor", mahallas: ["Jondor MFY", "Dalmun MFY", "Peshku MFY"] },
      { name: "Qorako'l", mahallas: ["Qorako'l MFY", "Chekachi MFY", "Ziyokor MFY"] },
      { name: "Shofirkon", mahallas: ["Shofirkon MFY", "Denov MFY", "Vardonze MFY"] },
    ],
  },
  {
    name: "Qashqadaryo viloyati",
    polyclinicPrefix: "QASH",
    districts: [
      { name: "Qarshi shahri", mahallas: ["Nasaf MFY", "Mustaqillik MFY", "Beshkent Yo'li MFY", "Geolog MFY", "Chaqar MFY"] },
      { name: "Shahrisabz shahri", mahallas: ["Oqsaroy MFY", "Zargaron MFY", "Chorshanbe MFY"] },
      { name: "Kitob", mahallas: ["Kitob MFY", "Varganza MFY", "Qaynar MFY"] },
      { name: "G'uzor", mahallas: ["G'uzor MFY", "Pachkamar MFY", "Sho'rtan MFY"] },
      { name: "Koson", mahallas: ["Koson MFY", "Pudina MFY", "Guzar MFY"] },
      { name: "Chiroqchi", mahallas: ["Chiroqchi MFY", "Ko'kdala MFY", "Langar MFY"] },
      { name: "Yakkabog'", mahallas: ["Yakkabog' MFY", "Esat MFY", "Tatar MFY"] },
      { name: "Muborak", mahallas: ["Muborak MFY", "Qarliq MFY", "Sariq MFY"] },
    ],
  },
  {
    name: "Surxondaryo viloyati",
    polyclinicPrefix: "SUR",
    districts: [
      { name: "Termiz shahri", mahallas: ["Al-Hakim at-Termiziy MFY", "Do'stlik MFY", "Baxtli MFY", "Tuproqqo'rg'on MFY"] },
      { name: "Denov", mahallas: ["Denov Markaziy MFY", "Sina MFY", "Qiziljar MFY", "Hazorbog' MFY"] },
      { name: "Sherobod", mahallas: ["Sherobod MFY", "Zarautsoy MFY", "Vandob MFY"] },
      { name: "Boysun", mahallas: ["Boysun MFY", "Darband MFY", "Machay MFY"] },
      { name: "Sho'rchi", mahallas: ["Sho'rchi MFY", "Bobotog' MFY", "Kushon MFY"] },
      { name: "Jarqo'rg'on", mahallas: ["Jarqo'rg'on MFY", "Minor MFY", "Kakaydi MFY"] },
      { name: "Qumqo'rg'on", mahallas: ["Qumqo'rg'on MFY", "Elbayon MFY", "Arpapoya MFY"] },
    ],
  },
  {
    name: "Xorazm viloyati",
    polyclinicPrefix: "XOR",
    districts: [
      { name: "Urganch shahri", mahallas: ["Al-Xorazmiy MFY", "Jaloliddin Manguberdi MFY", "Temiryo'lchi MFY", "Navbahor MFY"] },
      { name: "Xiva shahri", mahallas: ["Ichan Qal'a MFY", "Dishan Qal'a MFY", "Mevaston MFY", "Gandimiyon MFY"] },
      { name: "Xazorasp", mahallas: ["Xazorasp MFY", "Pitnak MFY", "Karvak MFY"] },
      { name: "Bog'ot", mahallas: ["Bog'ot MFY", "Qipchoq MFY", "Mirishkor MFY"] },
      { name: "Gurlan", mahallas: ["Gurlan MFY", "Vazir MFY", "Sholikor MFY"] },
      { name: "Shovot", mahallas: ["Shovot MFY", "Qiyot MFY", "Katqal'a MFY"] },
      { name: "Xonqa", mahallas: ["Xonqa MFY", "Madir MFY", "Qoraqosh MFY"] },
    ],
  },
  {
    name: "Jizzax viloyati",
    polyclinicPrefix: "JIZ",
    districts: [
      { name: "Jizzax shahri", mahallas: ["Sharof Rashidov MFY", "Zilol MFY", "Ittifoq MFY", "Hamid Olimjon MFY"] },
      { name: "Zomin", mahallas: ["Zomin MFY", "Dashtobod MFY", "Duoba MFY"] },
      { name: "G'allaorol", mahallas: ["G'allaorol MFY", "Sangzor MFY", "Marjonbuloq MFY"] },
      { name: "Baxmal", mahallas: ["Usmat MFY", "O'smat MFY", "Novqa MFY"] },
      { name: "Forish", mahallas: ["Bog'don MFY", "Qizilqum MFY", "Uchma MFY"] },
      { name: "Paxtakor", mahallas: ["Paxtakor MFY", "Buyuk Ipak Yo'li MFY"] },
    ],
  },
  {
    name: "Navoiy viloyati",
    polyclinicPrefix: "NAV",
    districts: [
      { name: "Navoiy shahri", mahallas: ["Alisher Navoiy MFY", "Vatan MFY", "Me'mor MFY", "Kimyogar MFY"] },
      { name: "Zarafshon shahri", mahallas: ["Zarafshon-1 MFY", "Geolog MFY", "Bahor MFY"] },
      { name: "Karmana", mahallas: ["Karmana MFY", "Malikrabot MFY", "Hazora MFY"] },
      { name: "Qiziltepa", mahallas: ["Qiziltepa MFY", "Toshrabot MFY", "Vang'ozi MFY"] },
      { name: "Nurota", mahallas: ["Nurota Chashma MFY", "G'ozg'on MFY", "Sentob MFY"] },
      { name: "Uchquduq", mahallas: ["Uchquduq MFY", "Mingbuloq MFY"] },
    ],
  },
  {
    name: "Sirdaryo viloyati",
    polyclinicPrefix: "SIR",
    districts: [
      { name: "Guliston shahri", mahallas: ["Bahor MFY", "Taraqqiyot MFY", "Bo'ston MFY", "Do'stlik MFY"] },
      { name: "Yangiyer shahri", mahallas: ["Shodlik MFY", "Navro'zobod MFY", "Bobur MFY"] },
      { name: "Shirin shahri", mahallas: ["Farhod MFY", "Mirzo Ulug'bek MFY"] },
      { name: "Sirdaryo tumani", mahallas: ["Baxt MFY", "Malik MFY", "Quyi Sirdaryo MFY"] },
      { name: "Boyovut", mahallas: ["Boyovut MFY", "Dehqonobod MFY", "Mirobod MFY"] },
      { name: "Mirzaobod", mahallas: ["Navro'z MFY", "Toshkent MFY", "Oqoltin MFY"] },
    ],
  },
  {
    name: "Qoraqalpog'iston Respublikasi",
    polyclinicPrefix: "QRK",
    districts: [
      { name: "Nukus shahri", mahallas: ["Turan MFY", "Qumovul MFY", "Dosliq MFY", "Jipek Joli MFY", "Berdaq MFY"] },
      { name: "Beruniy", mahallas: ["Beruniy MFY", "Shabboz MFY", "Biibozor MFY"] },
      { name: "To'rtko'l", mahallas: ["To'rtko'l MFY", "Kaltaminor MFY", "Otauba MFY"] },
      { name: "Xo'jayli", mahallas: ["Xo'jayli MFY", "Mizdakxon MFY", "Vodnik MFY"] },
      { name: "Qo'ng'irot", mahallas: ["Qo'ng'irot MFY", "Jasliq MFY", "Qoraqalpog'iston MFY"] },
      { name: "Chimboy", mahallas: ["Chimboy MFY", "Ken'es MFY", "Qizil O'zak MFY"] },
      { name: "Mo'ynoq", mahallas: ["Mo'ynoq MFY", "Tik O'zak MFY", "Uchsov MFY"] },
      { name: "Ellikqal'a", mahallas: ["Bo'ston MFY", "Qirqqiz MFY", "Saribiy MFY"] },
    ],
  },
];

export function resolvePolyclinicForLocation(
  districtInput: string,
  regionInput?: string
): { polyclinicId: string; polyclinicName: string; normalizedDistrict: string } {
  const districtClean = (districtInput || "").trim() || "Yunusobod";
  const lowerDistrict = districtClean.toLowerCase();
  const lowerRegion = (regionInput || "").toLowerCase();

  // Preserve core demo polyclinic mappings so seeded doctors match directly
  if (lowerDistrict.includes("namangan") || lowerDistrict.includes("davlatobod")) {
    return {
      polyclinicId: "OP-03-NAMANGAN",
      polyclinicName: `3-sonli Oilaviy Poliklinika (${districtClean}, Namangan)`,
      normalizedDistrict: districtClean,
    };
  }

  if (
    lowerDistrict.includes("yunusobod") ||
    lowerDistrict.includes("chilonzor") ||
    lowerRegion.includes("toshkent shahri")
  ) {
    return {
      polyclinicId: "OP-14-YUNUSOBOD",
      polyclinicName: `14-sonli Oilaviy Poliklinika (${districtClean})`,
      normalizedDistrict: districtClean,
    };
  }

  const matchedRegion =
    UZ_REGIONS.find(
      (r) =>
        r.name.toLowerCase() === lowerRegion ||
        r.districts.some((d) => d.name.toLowerCase() === lowerDistrict)
    ) ?? UZ_REGIONS[0];

  const slug = districtClean
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 14);

  return {
    polyclinicId: `OP-${matchedRegion.polyclinicPrefix}-${slug || "01"}`,
    polyclinicName: `Hududiy Oilaviy Poliklinika (${districtClean}, ${matchedRegion.name})`,
    normalizedDistrict: districtClean,
  };
}
