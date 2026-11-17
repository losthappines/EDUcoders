import { prisma } from "./db";
import { encryptField, maskJshshir } from "./crypto";
import { hashPassword } from "./auth";
import { slaMemoryQueue } from "./sla-queue";
import {
  buildEpikrizDocumentHtml,
  buildUltrasoundSvg,
  putStorageObject,
} from "./storage";
import type {
  AgentTraceStep,
  ChecklistItem,
  DoctorScheduleSlot,
  LabResultItem,
  NotificationLogEntry,
  PatientGuide,
  VitalsSnapshot,
} from "./types";

let seedingPromise: Promise<void> | null = null;
let backfillChecked = false;
let schemaChecked = false;
let schemaPromise: Promise<void> | null = null;

async function ensureAuthSchemaColumns(): Promise<void> {
  if (schemaChecked) return;
  if (!schemaPromise) {
    schemaPromise = (async () => {
      try {
        await prisma.$executeRawUnsafe(
          `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "passwordHash" TEXT NOT NULL DEFAULT ''`
        );
        await prisma.$executeRawUnsafe(
          `ALTER TABLE "patients" ADD COLUMN IF NOT EXISTS "userId" TEXT`
        );
        await prisma.$executeRawUnsafe(
          `CREATE UNIQUE INDEX IF NOT EXISTS "patients_userId_key" ON "patients"("userId")`
        );
        await prisma.$executeRawUnsafe(`
          DO $$
          BEGIN
            IF NOT EXISTS (
              SELECT 1 FROM pg_constraint WHERE conname = 'patients_userId_fkey'
            ) THEN
              ALTER TABLE "patients"
              ADD CONSTRAINT "patients_userId_fkey"
              FOREIGN KEY ("userId") REFERENCES "users"("id")
              ON DELETE SET NULL ON UPDATE CASCADE;
            END IF;
          END $$;
        `);
        schemaChecked = true;
      } catch (err) {
        // Ignore if already exists or handled by prisma db push
        console.warn("ensureAuthSchemaColumns note:", err instanceof Error ? err.message : err);
      } finally {
        schemaPromise = null;
      }
    })();
  }
  await schemaPromise;
}

export async function ensureSeeded(): Promise<void> {
  await ensureAuthSchemaColumns();
  const [userCount, patientCount] = await Promise.all([
    prisma.user.count(),
    prisma.patient.count(),
  ]);
  if (userCount > 0 && patientCount > 0) {
    if (!backfillChecked) {
      backfillChecked = true;
      const missingPassUsers = await prisma.user.findMany({
        where: { passwordHash: "" },
        select: { id: true },
      });
      if (missingPassUsers.length > 0) {
        const fallbackHash = hashPassword("Demo1234!");
        await prisma.user.updateMany({
          where: { passwordHash: "" },
          data: { passwordHash: fallbackHash },
        });
      }
      await prisma.patient.updateMany({
        where: { id: "pat-zulfiya", userId: null },
        data: { userId: "usr-patient-1" },
      });
    }
    return;
  }

  if (!seedingPromise) {
    seedingPromise = resetDemoDatabase().finally(() => {
      seedingPromise = null;
    });
  }
  await seedingPromise;
}

export async function resetDemoDatabase(): Promise<void> {
  backfillChecked = true;
  slaMemoryQueue.clear();
  await prisma.$transaction([
    prisma.auditLog.deleteMany(),
    prisma.invoice.deleteMany(),
    prisma.activeCall.deleteMany(),
    prisma.prescription.deleteMany(),
    prisma.labReport.deleteMany(),
    prisma.ehrRecord.deleteMany(),
    prisma.patient.deleteMany(),
    prisma.user.deleteMany(),
    prisma.systemSimState.deleteMany(),
  ]);
  await seedDemoData();
}

async function seedDemoData(): Promise<void> {
  const now = new Date();
  const hoursAgo = (h: number) => new Date(now.getTime() - h * 3600 * 1000);
  const hoursFrom = (base: Date, h: number) =>
    new Date(base.getTime() + h * 3600 * 1000);
  const defaultPasswordHash = hashPassword("Demo1234!");

  await prisma.systemSimState.upsert({
    where: { id: "singleton" },
    update: { timeOffsetHours: 0 },
    create: { id: "singleton", timeOffsetHours: 0 },
  });

  // 1. Users (4 distinct RBAC roles + second Family MD for Namangan)
  const ovabmuDoc = await prisma.user.create({
    data: {
      id: "usr-ovabmu-1",
      email: "a.rahimova@ovabmu.uz",
      passwordHash: defaultPasswordHash,
      fullName: "Dr. Aziza Rahimova",
      role: "OVABMU_MD",
      polyclinicId: "OVABMU-TSH-01",
      polyclinicName: "Respublika Ona va Bola Salomatligi Markazi (OvaBMU)",
      district: "Toshkent shahri",
      specialty: "Oliy toifali akusher-ginekolog, reanimatsiya bo'limi",
      phone: "+998 90 311-45-10",
      telegramHandle: "@dr_aziza_ovabmu",
      scheduleSlotsJson: "[]",
    },
  });

  const familyDocTashkent = await prisma.user.create({
    data: {
      id: "usr-family-tashkent",
      email: "d.toshmatova@op14.uz",
      passwordHash: defaultPasswordHash,
      fullName: "Dr. Dilnoza Toshmatova",
      role: "FAMILY_MD",
      polyclinicId: "OP-14-YUNUSOBOD",
      polyclinicName: "14-sonli Oilaviy Poliklinika (Yunusobod / Chilonzor)",
      district: "Yunusobod, Chilonzor",
      specialty: "Hududiy oilaviy shifokor (Patronaj guruhi)",
      phone: "+998 90 772-18-44",
      telegramHandle: "@dr_dilnoza_op14",
      scheduleSlotsJson: JSON.stringify([
        { slotId: "slot-1", startHourOffset: 2, endHourOffset: 4, bookedPatientId: "pat-zulfiya" },
        { slotId: "slot-2", startHourOffset: 5, endHourOffset: 7, bookedPatientId: null },
        { slotId: "slot-3", startHourOffset: 9, endHourOffset: 11, bookedPatientId: null },
      ] satisfies DoctorScheduleSlot[]),
    },
  });

  const familyDocNamangan = await prisma.user.create({
    data: {
      id: "usr-family-namangan",
      email: "s.mirzayev@op3-nam.uz",
      passwordHash: defaultPasswordHash,
      fullName: "Dr. Sardorbek Mirzayev",
      role: "FAMILY_MD",
      polyclinicId: "OP-03-NAMANGAN",
      polyclinicName: "3-sonli Oilaviy Poliklinika (Davlatobod, Namangan)",
      district: "Davlatobod, Namangan",
      specialty: "Hududiy oilaviy shifokor",
      phone: "+998 93 412-90-12",
      telegramHandle: "@dr_sardor_namangan",
      scheduleSlotsJson: JSON.stringify([
        { slotId: "slot-n1", startHourOffset: 14, endHourOffset: 16, bookedPatientId: "pat-dilfuza" },
        { slotId: "slot-n2", startHourOffset: 18, endHourOffset: 20, bookedPatientId: null },
      ] satisfies DoctorScheduleSlot[]),
    },
  });

  const patientUser = await prisma.user.create({
    data: {
      id: "usr-patient-1",
      email: "zulfiya.rustamova@patient.uz",
      passwordHash: defaultPasswordHash,
      fullName: "Zulfiya Rustamova",
      role: "PATIENT",
      polyclinicId: "OP-14-YUNUSOBOD",
      polyclinicName: "14-sonli Oilaviy Poliklinika",
      district: "Chilonzor",
      specialty: "Bemor",
      phone: "+998 90 554-21-09",
      telegramHandle: "@zulfiya_r",
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      id: "usr-admin-1",
      email: "sh.alimov@ssv.uz",
      passwordHash: defaultPasswordHash,
      fullName: "Sherzod Alimov",
      role: "ADMIN_RECEPTION",
      polyclinicId: "TTB-ADMIN-01",
      polyclinicName: "Tuman Tibbiyot Birlashmasi — Qabulxona va SLA Nazorati",
      district: "Toshkent / Namangan",
      specialty: "Bosh koordinator / Qabulxona admini",
      phone: "+998 99 801-12-00",
      telegramHandle: "@ttb_admin_sla",
    },
  });

  // =========================================================================
  // CASE 1: Malika Karimova — INPATIENT in OvaBMU (Ready for Live Discharge Demo!)
  // =========================================================================
  const malikaJshshir = "49704185230024";
  const malika = await prisma.patient.create({
    data: {
      id: "pat-malika",
      fullName: "Malika Karimova",
      jshshirEncrypted: encryptField(malikaJshshir),
      jshshirMasked: maskJshshir(malikaJshshir),
      dateOfBirth: "1997-04-18",
      phone: "+998 90 441-88-32",
      district: "Yunusobod",
      mahalla: "Bog'ishamol MFY",
      address: "Bog'ishamol ko'chasi, 42-uy, 12-xonadon",
      bloodType: "A(II) Rh+",
      allergiesJson: JSON.stringify(["Penitsillin (toshma)", "Sulfanilamidlar"]),
      polyclinicId: "OP-14-YUNUSOBOD",
      polyclinicName: "14-sonli Oilaviy Poliklinika (Yunusobod)",
      assignedFamilyDoctorId: familyDocTashkent.id,
      emergencyContact: "Karimov Rustam (Turmush o'rtog'i) • +998 90 441-88-33",
      status: "INPATIENT",
      bedNumber: "Palata №204 (Akusherlik reanimatsiya)",
      admittedAt: hoursAgo(96),
    },
  });

  const malikaUziKey = "imaging/malika-uzi-doppler.svg";
  await putStorageObject(
    malikaUziKey,
    buildUltrasoundSvg(
      malika.fullName,
      "Bachadon involyutsiyasi 132mm • Chok sohasida gematoma yo'q • Doppler N"
    ),
    "image/svg+xml"
  );

  const malikaVitals: VitalsSnapshot = {
    systolicBp: 158,
    diastolicBp: 98,
    heartRate: 94,
    tempC: 37.1,
    spo2: 97,
    respRate: 20,
    recordedAt: hoursAgo(1).toISOString(),
    phase: "INPATIENT_PRE_DISCHARGE",
  };

  await prisma.ehrRecord.create({
    data: {
      id: "ehr-malika-1",
      patientId: malika.id,
      authorId: ovabmuDoc.id,
      recordType: "INPATIENT_SUMMARY",
      diagnosisIcd10: "O14.1",
      diagnosisText:
        "Og'ir preeklampsiya. Shoshilinch kesarcha kesishdan keyingi 4-sutka. Yengil darajadagi gipoproteinemiya va o'rta darajali anemiya.",
      severity: "SEVERE",
      clinicalNotesEncrypted: encryptField(
        "Bemor og'ir preeklampsiya (AQB 175/110, proteinuriya 3.2 g/L) bilan qabul qilindi. Magneziya terapiyasi (MgSO4) va shoshilinch kesarcha kesish o'tkazildi. Hozirda ahvoli barqarorlashgan, lekin AQB 158/98 mmHg saqlanmoqda. Uy sharoitida qat'iy 24 soatlik oilaviy shifokor patronaji talab etiladi."
      ),
      vitalsJson: JSON.stringify(malikaVitals),
      proceduresJson: JSON.stringify([
        "Shoshilinch kesarcha kesish (Pfannenshtil)",
        "Vena ichiga MgSO4 25% yuklama va tutib turuvchi terapiya",
        "Antigipertenziv kombinatsiyalangan terapiya",
      ]),
      dischargeDocumentKey: malikaUziKey,
    },
  });

  const malikaLabs: LabResultItem[] = [
    { testName: "Hemoglobin (Hb)", value: "96", numericValue: 96, unit: "g/L", refRange: "120–145", flag: "LOW" },
    { testName: "Proteinuria (24h Urine)", value: "2.4", numericValue: 2.4, unit: "g/L", refRange: "< 0.15", flag: "CRITICAL" },
    { testName: "Platelets (PLT)", value: "138", numericValue: 138, unit: "×10⁹/L", refRange: "150–400", flag: "LOW" },
    { testName: "ALT (Alanine Transaminase)", value: "54", numericValue: 54, unit: "U/L", refRange: "7–35", flag: "HIGH" },
    { testName: "Creatinine", value: "88", numericValue: 88, unit: "µmol/L", refRange: "44–80", flag: "HIGH" },
  ];

  await prisma.labReport.create({
    data: {
      id: "lab-malika-1",
      patientId: malika.id,
      orderedById: ovabmuDoc.id,
      panelName: "OvaBMU Preeklampsiya & HELLP Skrining Paneli",
      status: "COMPLETED",
      resultsJson: JSON.stringify(malikaLabs),
      attachmentKey: malikaUziKey,
      reportedAt: hoursAgo(3),
    },
  });

  await prisma.prescription.createMany({
    data: [
      {
        id: "rx-malika-1",
        patientId: malika.id,
        prescribedById: ovabmuDoc.id,
        medicationName: "Nifedipin SR",
        dosage: "20 mg",
        frequency: "Kuniga 2 mahal (ertalab va kechqurun)",
        durationDays: 14,
        instructionsUz: "Qon bosimini o'lchab iching, chaynamasdan yuting.",
        instructionsRu: "Принимать 2 раза в день под контролем АД, не разжевывать.",
        instructionsEn: "Take twice daily with BP monitoring; swallow whole.",
        pharmacyStockStatus: "IN_STOCK",
        polyclinicPharmacy: "14-OP Ijtimoiy Dorixonasi",
        adherenceLogsJson: JSON.stringify([{ date: now.toISOString().slice(0, 10), taken: true }]),
      },
      {
        id: "rx-malika-2",
        patientId: malika.id,
        prescribedById: ovabmuDoc.id,
        medicationName: "Metildopa (Dopegit)",
        dosage: "250 mg",
        frequency: "Kuniga 3 mahal",
        durationDays: 14,
        instructionsUz: "Emizikli onalar uchun xavfsiz, muntazam qabul qiling.",
        instructionsRu: "Безопасно при лактации, принимать регулярно 3 раза в день.",
        instructionsEn: "Safe for breastfeeding; take 3 times daily regularly.",
        pharmacyStockStatus: "IN_STOCK",
        polyclinicPharmacy: "14-OP Ijtimoiy Dorixonasi",
        adherenceLogsJson: JSON.stringify([{ date: now.toISOString().slice(0, 10), taken: true }]),
      },
      {
        id: "rx-malika-3",
        patientId: malika.id,
        prescribedById: ovabmuDoc.id,
        medicationName: "Ferrum Lek (Temir III)",
        dosage: "100 mg",
        frequency: "Kuniga 1 mahal ovqat bilan",
        durationDays: 30,
        instructionsUz: "Gemoglobinni tiklash uchun choy va sutsiz iching.",
        instructionsRu: "Для восстановления гемоглобина, не запивать чаем или молоком.",
        instructionsEn: "Take once daily with food for anemia recovery; avoid tea.",
        pharmacyStockStatus: "RESERVED",
        polyclinicPharmacy: "14-OP Ijtimoiy Dorixonasi",
        adherenceLogsJson: JSON.stringify([]),
      },
    ],
  });

  // =========================================================================
  // CASE 2: Zulfiya Rustamova — PATRONAGE_ACTIVE (Discharged 9.5h ago -> Green, flips to Red on +12h!)
  // =========================================================================
  const zulfiyaJshshir = "49208116040057";
  const zulfiyaDischargeTime = hoursAgo(9.5);
  const zulfiya = await prisma.patient.create({
    data: {
      id: "pat-zulfiya",
      userId: patientUser.id,
      fullName: "Zulfiya Rustamova",
      jshshirEncrypted: encryptField(zulfiyaJshshir),
      jshshirMasked: maskJshshir(zulfiyaJshshir),
      dateOfBirth: "1992-08-11",
      phone: "+998 90 554-21-09",
      district: "Chilonzor",
      mahalla: "Qatortol MFY",
      address: "Qatortol 7-mavze, 18-uy, 45-xonadon",
      bloodType: "O(I) Rh-",
      allergiesJson: JSON.stringify(["Allergiya aniqlanmagan"]),
      polyclinicId: "OP-14-YUNUSOBOD",
      polyclinicName: "14-sonli Oilaviy Poliklinika (Chilonzor filiali)",
      assignedFamilyDoctorId: familyDocTashkent.id,
      emergencyContact: "Rustamov Bobur (Turmush o'rtog'i) • +998 90 554-21-10",
      status: "PATRONAGE_ACTIVE",
      bedNumber: null,
      admittedAt: hoursAgo(120),
      dischargedAt: zulfiyaDischargeTime,
    },
  });

  const zulfiyaEpikrizKey = "ovabmu-epikriz/zulfiya-epikriz.html";
  const zulfiyaNotes =
    "Tug'ruqdan keyingi erta davrda atonik qon ketish (1100 ml). Uterotoniklar, B-Lynch chok va 2 birlik eritrotsitar massa quyildi. Chiqarish vaqtida Hb 78 g/L, ortostatik bosh aylanishi saqlanmoqda. 24 soatlik majburiy patronaj belgilandi.";
  await putStorageObject(
    zulfiyaEpikrizKey,
    buildEpikrizDocumentHtml({
      patientName: zulfiya.fullName,
      jshshirMasked: zulfiya.jshshirMasked,
      dob: zulfiya.dateOfBirth,
      district: zulfiya.district,
      mahalla: zulfiya.mahalla,
      diagnosisIcd10: "O72.1",
      diagnosisText:
        "Tug'ruqdan keyingi og'ir atonik qon ketish. Og'ir darajadagi postgemorragik temir tanqisligi anemiyasi.",
      severity: "SEVERE",
      clinicalNotes: zulfiyaNotes,
      polyclinicName: zulfiya.polyclinicName,
      doctorName: ovabmuDoc.fullName,
      dischargedAt: zulfiyaDischargeTime.toISOString(),
    })
  );

  await prisma.ehrRecord.create({
    data: {
      id: "ehr-zulfiya-1",
      patientId: zulfiya.id,
      authorId: ovabmuDoc.id,
      recordType: "DISCHARGE_EPIKRIZ",
      diagnosisIcd10: "O72.1",
      diagnosisText:
        "Tug'ruqdan keyingi og'ir atonik qon ketish va og'ir postgemorragik anemiya",
      severity: "SEVERE",
      clinicalNotesEncrypted: encryptField(zulfiyaNotes),
      vitalsJson: JSON.stringify({
        systolicBp: 98,
        diastolicBp: 62,
        heartRate: 104,
        tempC: 36.7,
        spo2: 96,
        respRate: 19,
        recordedAt: zulfiyaDischargeTime.toISOString(),
        phase: "INPATIENT_PRE_DISCHARGE",
      } satisfies VitalsSnapshot),
      proceduresJson: JSON.stringify([
        "B-Lynch bachadon kompressiya choki",
        "Eritrotsitar massa transfuziyasi (2 dona)",
        "Vena ichiga Temir karboksimaltoza (Ferinject)",
      ]),
      dischargeDocumentKey: zulfiyaEpikrizKey,
      createdAt: zulfiyaDischargeTime,
    },
  });

  await prisma.labReport.create({
    data: {
      id: "lab-zulfiya-1",
      patientId: zulfiya.id,
      orderedById: ovabmuDoc.id,
      panelName: "Chiqarish Qon Umumiy Tahlili va Koagulogramma",
      status: "COMPLETED",
      resultsJson: JSON.stringify([
        { testName: "Hemoglobin (Hb)", value: "78", numericValue: 78, unit: "g/L", refRange: "120–145", flag: "CRITICAL" },
        { testName: "Hematocrit (HCT)", value: "24.2", numericValue: 24.2, unit: "%", refRange: "36–44", flag: "LOW" },
        { testName: "Fibrinogen", value: "2.1", numericValue: 2.1, unit: "g/L", refRange: "2.0–4.0", flag: "NORMAL" },
        { testName: "Ferritin", value: "11", numericValue: 11, unit: "ng/mL", refRange: "15–150", flag: "LOW" },
      ] satisfies LabResultItem[]),
      attachmentKey: zulfiyaEpikrizKey,
      reportedAt: hoursAgo(11),
    },
  });

  await prisma.prescription.createMany({
    data: [
      {
        id: "rx-zulfiya-1",
        patientId: zulfiya.id,
        prescribedById: ovabmuDoc.id,
        medicationName: "Sorbifer Durules",
        dosage: "320 mg + 60 mg",
        frequency: "Kuniga 2 mahal",
        durationDays: 45,
        instructionsUz: "Ovqatdan 30 daqiqa oldin 1 stakan suv bilan iching.",
        instructionsRu: "За 30 минут до еды, запивать стаканом воды.",
        instructionsEn: "Take 30 min before meals with a full glass of water.",
        pharmacyStockStatus: "IN_STOCK",
        polyclinicPharmacy: "14-OP Ijtimoiy Dorixonasi",
        adherenceLogsJson: JSON.stringify([{ date: now.toISOString().slice(0, 10), taken: true }]),
      },
      {
        id: "rx-zulfiya-2",
        patientId: zulfiya.id,
        prescribedById: ovabmuDoc.id,
        medicationName: "Foliy kislotasi",
        dosage: "5 mg",
        frequency: "Kuniga 1 mahal",
        durationDays: 30,
        instructionsUz: "Ertalab nonushtadan keyin iching.",
        instructionsRu: "Утром после завтрака 1 раз в день.",
        instructionsEn: "Take once daily after breakfast.",
        pharmacyStockStatus: "IN_STOCK",
        polyclinicPharmacy: "14-OP Ijtimoiy Dorixonasi",
        adherenceLogsJson: JSON.stringify([]),
      },
    ],
  });

  const zulfiyaChecklist: ChecklistItem[] = [
    {
      id: "chk-ortho",
      titleUz: "Ortostatik qon bosimi, puls va shilliq qavat rangparligini tekshirish",
      titleRu: "Проверка ортостатического АД, пульса и бледности",
      titleEn: "Assess orthostatic BP, pulse, and mucosal pallor",
      category: "VITALS",
      checked: false,
    },
    {
      id: "chk-uterus",
      titleUz: "Bachadon tubi balandligi, tonusi va loxiyalar hajmini baholash",
      titleRu: "Оценка высоты дна матки, тонуса и лохий",
      titleEn: "Assess uterine fundal height, tone, and lochia volume",
      category: "PHYSICAL_EXAM",
      checked: false,
    },
    {
      id: "chk-hb",
      titleUz: "Uyda qon umumiy tahlili (Gemoglobin/Gematokrit) qayta nazorati",
      titleRu: "Повторный контроль ОАК (Гемоглобин/Гематокрит)",
      titleEn: "Follow-up CBC (Hemoglobin/Hematocrit) blood test",
      category: "LAB_CHECK",
      checked: false,
    },
    {
      id: "chk-iron",
      titleUz: "Sorbifer Durules va Foliy kislotasi qabulini tekshirish",
      titleRu: "Контроль приема Сорбифер Дурулес и фолиевой кислоты",
      titleEn: "Verify Sorbifer & folic acid adherence",
      category: "MEDICATION",
      checked: false,
    },
    {
      id: "chk-faint",
      titleUz: "Bosh aylanishi, hushdan ketish xavfi va laktatsiya holatini baholash",
      titleRu: "Оценка головокружения и лактации",
      titleEn: "Screen for syncope risk and breastfeeding adequacy",
      category: "RED_FLAG",
      checked: false,
    },
  ];

  const zulfiyaGuide: PatientGuide = {
    summaryUz:
      "Hurmatli Zulfiya, tug'ruqdan keyingi qon yo'qotish va kamqonlik (Hb 78 g/L) sababli sizga 24 soatlik majburiy uy patronaji tayinlandi.",
    summaryRu:
      "Уважаемая Зульфия, из-за послеродовой анемии (Hb 78 г/л) вам назначен обязательный 24-часовой домашний патронаж.",
    summaryEn:
      "Dear Zulfiya, due to postpartum hemorrhage and severe anemia (Hb 78 g/L), mandatory 24-hour home patronage has been scheduled.",
    dailyRulesUz: [
      "Temir dorilarini choy, kofe yoki sut bilan ichmang — faqat suv yoki sharbat bilan iching",
      "Yotoqdan keskin turmang — avval o'tirib, 1 daqiqa kuting",
      "Kuniga kamida 2 litr iliq suyuqlik va oqsilga boy taomlar iste'mol qiling",
    ],
    dailyRulesRu: [
      "Не запивайте железо чаем, кофе или молоком — только водой",
      "Не вставайте резко с кровати — сначала посидите 1 минуту",
      "Пейте достаточно воды и употребляйте богатую железом пищу",
    ],
    dailyRulesEn: [
      "Never take iron pills with tea or dairy — use plain water or juice",
      "Rise slowly from bed to prevent orthostatic dizziness",
      "Hydrate well and prioritize iron-rich protein meals",
    ],
    emergencySignsUz: [
      "1 soatda 1 tadan ortiq prokladka to'lib ketsa",
      "Kuchli bosh aylanishi yoki ko'z oldi qorong'ilashsa",
      "Yurak 115+ tezlikda urib nafas qisilsa",
    ],
    emergencySignsRu: [
      "Промокание более 1 прокладки за час",
      "Сильное головокружение или потемнение в глазах",
      "Учащенное сердцебиение (>115 уд/мин) и одышка",
    ],
    emergencySignsEn: [
      "Soaking >1 pad per hour",
      "Severe dizziness or near-fainting",
      "Heart rate >115 bpm with shortness of breath",
    ],
  };

  const zulfiyaTrace: AgentTraceStep[] = [
    {
      step: 1,
      agentName: "EHR & Lab Synthesis Agent",
      toolCalled: "analyze_inpatient_ehr_and_labs",
      durationMs: 31,
      status: "COMPLETED",
      summary: "Computed Risk Score 86/100 due to Hb 78 g/L (CRITICAL) & tachycardia 104 bpm.",
      structuredOutput: { post_discharge_risk_score: 86, severity: "SEVERE" },
    },
    {
      step: 2,
      agentName: "Territorial Routing & Conflict Agent",
      toolCalled: "route_polyclinic_and_book_24h_slot",
      durationMs: 24,
      status: "COMPLETED",
      summary: "Routed Chilonzor (Qatortol MFY) -> Dr. Dilnoza Toshmatova (OP-14). Conflict-free slot booked.",
      structuredOutput: { doctor: "Dr. Dilnoza Toshmatova", polyclinic: "14-sonli OP" },
    },
    {
      step: 3,
      agentName: "Clinical Checklist & Patient Guide Agent",
      toolCalled: "generate_uz_checklist_and_patient_guide",
      durationMs: 28,
      status: "COMPLETED",
      summary: "Generated 5-item postpartum hemorrhage & anemia Uzbek checklist + multilingual patient guide.",
      structuredOutput: { checklist_items: 5 },
    },
    {
      step: 4,
      agentName: "Autonomous SLA Escalation & Triage Agent",
      toolCalled: "initialize_24h_sla_and_dispatch_alerts",
      durationMs: 19,
      status: "COMPLETED",
      summary: "24h SLA timer started; Telegram alert & Patient OTP 4829 sent.",
      structuredOutput: { priority: "CRITICAL", otp_issued: true },
    },
  ];

  const zulfiyaCall = await prisma.activeCall.create({
    data: {
      id: "call-zulfiya",
      patientId: zulfiya.id,
      dischargedById: ovabmuDoc.id,
      assignedDoctorId: familyDocTashkent.id,
      polyclinicName: "14-sonli Oilaviy Poliklinika (Chilonzor filiali)",
      district: "Chilonzor",
      status: "SCHEDULED",
      priority: "CRITICAL",
      riskScore: 86,
      redFlagsJson: JSON.stringify([
        "Og'ir anemiya: Gemoglobin 78 g/L (kritik past)",
        "Taxikardiya: Puls 104 zarb/daq (gipovolemik xavf)",
        "Postgemorragik ortostatik gipotenziya: AQB 98/62 mmHg",
      ]),
      checklistJson: JSON.stringify(zulfiyaChecklist),
      patientGuideJson: JSON.stringify(zulfiyaGuide),
      scheduledWindowStart: hoursFrom(zulfiyaDischargeTime, 11),
      scheduledWindowEnd: hoursFrom(zulfiyaDischargeTime, 13),
      dischargedAt: zulfiyaDischargeTime,
      slaDeadlineAt: hoursFrom(zulfiyaDischargeTime, 24),
      escalationLevel: 0,
      patientOtpCode: "4829",
      aiAgentTraceJson: JSON.stringify(zulfiyaTrace),
      notificationLogJson: JSON.stringify([
        {
          id: "notif-zulfiya-1",
          channel: "TELEGRAM",
          recipientName: familyDocTashkent.fullName,
          recipientRole: "FAMILY_MD",
          recipientHandle: "@dr_dilnoza_op14",
          message:
            "🩺 [YANGI AKTIV CHAQIRUV] Bemor: Zulfiya Rustamova (Chilonzor, Qatortol MFY). O72.1 Og'ir anemiya Hb 78 g/L. Xavf: 86/100.",
          severity: "CRITICAL",
          sentAt: zulfiyaDischargeTime.toISOString(),
        },
      ] satisfies NotificationLogEntry[]),
    },
  });

  slaMemoryQueue.set(zulfiyaCall.id, {
    activeCallId: zulfiyaCall.id,
    patientId: zulfiya.id,
    assignedDoctorId: familyDocTashkent.id,
    slaDeadlineAtMs: zulfiyaCall.slaDeadlineAt.getTime(),
    dischargedAtMs: zulfiyaDischargeTime.getTime(),
    escalationLevel: 0,
    status: "SCHEDULED",
  });

  // =========================================================================
  // CASE 3: Dilfuza Xolmatova — ESCALATED_12H (Discharged 13.5h ago -> Yellow Warning!)
  // =========================================================================
  const dilfuzaJshshir = "40001257120083";
  const dilfuzaDischargeTime = hoursAgo(13.5);
  const dilfuza = await prisma.patient.create({
    data: {
      id: "pat-dilfuza",
      fullName: "Dilfuza Xolmatova",
      jshshirEncrypted: encryptField(dilfuzaJshshir),
      jshshirMasked: maskJshshir(dilfuzaJshshir),
      dateOfBirth: "2000-01-25",
      phone: "+998 93 611-77-40",
      district: "Davlatobod",
      mahalla: "Yuksalish MFY",
      address: "Yuksalish ko'chasi, 9-uy",
      bloodType: "B(III) Rh+",
      allergiesJson: JSON.stringify(["Novokain"]),
      polyclinicId: "OP-03-NAMANGAN",
      polyclinicName: "3-sonli Oilaviy Poliklinika (Davlatobod, Namangan)",
      assignedFamilyDoctorId: familyDocNamangan.id,
      emergencyContact: "Xolmatov Aziz (Turmush o'rtog'i) • +998 93 611-77-41",
      status: "PATRONAGE_ACTIVE",
      bedNumber: null,
      admittedAt: hoursAgo(110),
      dischargedAt: dilfuzaDischargeTime,
    },
  });

  const dilfuzaEpikrizKey = "ovabmu-epikriz/dilfuza-epikriz.html";
  const dilfuzaNotes =
    "Tug'ruqdan keyingi endometrit va sepsis xavfi (qabulda WBC 21.2, T 38.6°C). Keng spektrli antibiotik terapiyadan so'ng harorat 37.6°C ga tushdi. Uy sharoitida qat'iy sepsis monitoringi va antibiotik davomiyligi uchun patronaj zarur.";
  await putStorageObject(
    dilfuzaEpikrizKey,
    buildEpikrizDocumentHtml({
      patientName: dilfuza.fullName,
      jshshirMasked: dilfuza.jshshirMasked,
      dob: dilfuza.dateOfBirth,
      district: dilfuza.district,
      mahalla: dilfuza.mahalla,
      diagnosisIcd10: "O85.0",
      diagnosisText: "Tug'ruqdan keyingi endometrit / Sepsis nazorati",
      severity: "HIGH_RISK",
      clinicalNotes: dilfuzaNotes,
      polyclinicName: dilfuza.polyclinicName,
      doctorName: ovabmuDoc.fullName,
      dischargedAt: dilfuzaDischargeTime.toISOString(),
    })
  );

  await prisma.ehrRecord.create({
    data: {
      id: "ehr-dilfuza-1",
      patientId: dilfuza.id,
      authorId: ovabmuDoc.id,
      recordType: "DISCHARGE_EPIKRIZ",
      diagnosisIcd10: "O85.0",
      diagnosisText: "Tug'ruqdan keyingi endometrit (sepsis xavfi)",
      severity: "HIGH_RISK",
      clinicalNotesEncrypted: encryptField(dilfuzaNotes),
      vitalsJson: JSON.stringify({
        systolicBp: 112,
        diastolicBp: 72,
        heartRate: 96,
        tempC: 37.6,
        spo2: 98,
        respRate: 19,
        recordedAt: dilfuzaDischargeTime.toISOString(),
        phase: "INPATIENT_PRE_DISCHARGE",
      } satisfies VitalsSnapshot),
      proceduresJson: JSON.stringify([
        "Vena ichiga Seftriakson + Metronidazol terapiyasi",
        "Bachadon bo'shlig'i sanatsiyasi va UZI nazorati",
      ]),
      dischargeDocumentKey: dilfuzaEpikrizKey,
      createdAt: dilfuzaDischargeTime,
    },
  });

  await prisma.labReport.create({
    data: {
      id: "lab-dilfuza-1",
      patientId: dilfuza.id,
      orderedById: ovabmuDoc.id,
      panelName: "Yallig'lanish va Sepsis Markerlar Paneli",
      status: "COMPLETED",
      resultsJson: JSON.stringify([
        { testName: "WBC (Leukocytes)", value: "16.8", numericValue: 16.8, unit: "×10⁹/L", refRange: "4.0–10.5", flag: "HIGH" },
        { testName: "C-Reactive Protein (CRP)", value: "68", numericValue: 68, unit: "mg/L", refRange: "< 10", flag: "CRITICAL" },
        { testName: "Hemoglobin (Hb)", value: "108", numericValue: 108, unit: "g/L", refRange: "120–145", flag: "LOW" },
        { testName: "Procalcitonin", value: "0.42", numericValue: 0.42, unit: "ng/mL", refRange: "< 0.10", flag: "HIGH" },
      ] satisfies LabResultItem[]),
      attachmentKey: dilfuzaEpikrizKey,
      reportedAt: hoursAgo(15),
    },
  });

  await prisma.prescription.create({
    data: {
      id: "rx-dilfuza-1",
      patientId: dilfuza.id,
      prescribedById: ovabmuDoc.id,
      medicationName: "Sefiksim + Metronidazol",
      dosage: "400 mg / 500 mg",
      frequency: "Kuniga 2 mahal",
      durationDays: 7,
      instructionsUz: "Antibiotik kursini to'liq 7 kun yakunlang.",
      instructionsRu: "Завершите полный 7-дневный курс антибиотиков.",
      instructionsEn: "Complete the full 7-day antibiotic regimen.",
      pharmacyStockStatus: "LOW_STOCK",
      polyclinicPharmacy: "3-OP Dorixonasi (Namangan)",
      adherenceLogsJson: JSON.stringify([{ date: now.toISOString().slice(0, 10), taken: true }]),
    },
  });

  const dilfuzaCall = await prisma.activeCall.create({
    data: {
      id: "call-dilfuza",
      patientId: dilfuza.id,
      dischargedById: ovabmuDoc.id,
      assignedDoctorId: familyDocNamangan.id,
      polyclinicName: "3-sonli Oilaviy Poliklinika (Davlatobod, Namangan)",
      district: "Davlatobod",
      status: "ESCALATED_12H",
      priority: "HIGH",
      riskScore: 76,
      redFlagsJson: JSON.stringify([
        "Subfebril isitma: 37.6°C (sepsis qaytalash xavfi)",
        "Leykotsitoz: WBC 16.8 ×10⁹/L va CRP 68 mg/L",
        "12 soatlik SLA chegarasidan oshgan — zudlik bilan ko'rik zarur",
      ]),
      checklistJson: JSON.stringify([
        {
          id: "chk-temp",
          titleUz: "Tana harorati, puls va AQB ni o'lchash (qSOFA sepsis skriningi)",
          titleRu: "Измерение температуры, пульса и АД",
          titleEn: "Measure temperature, HR, and BP (qSOFA screen)",
          category: "VITALS",
          checked: true,
        },
        {
          id: "chk-palp",
          titleUz: "Qorin palpatsiyasi, bachadon og'riqliligi va loxiya hidini tekshirish",
          titleRu: "Пальпация живота и оценка лохий",
          titleEn: "Abdominal palpation and lochia assessment",
          category: "PHYSICAL_EXAM",
          checked: false,
        },
        {
          id: "chk-wound",
          titleUz: "Tug'ruq yo'llari chokida qizarish/yiringlash borligini ko'rish",
          titleRu: "Осмотр швов",
          titleEn: "Inspect wound for erythema or purulence",
          category: "RED_FLAG",
          checked: false,
        },
        {
          id: "chk-crp",
          titleUz: "WBC va CRP dinamikasini qayta tekshirish",
          titleRu: "Повторный контроль WBC и CRP",
          titleEn: "Follow-up WBC and CRP test",
          category: "LAB_CHECK",
          checked: false,
        },
        {
          id: "chk-abx",
          titleUz: "Antibiotik terapiya kursini nazorat qilish",
          titleRu: "Контроль курса антибиотиков",
          titleEn: "Verify antibiotic course adherence",
          category: "MEDICATION",
          checked: false,
        },
      ] satisfies ChecklistItem[]),
      patientGuideJson: JSON.stringify({
        summaryUz: "Hurmatli Dilfuza, yallig'lanish xavfini nazorat qilish uchun 24 soatlik shifokor ko'rigi tayinlangan.",
        summaryRu: "Уважаемая Дильфуза, назначен 24-часовой контроль для предотвращения инфекции.",
        summaryEn: "Dear Dilfuza, 24h follow-up scheduled for postpartum infection monitoring.",
        dailyRulesUz: ["Antibiotiklarni soatiga qarab iching", "Haroratni kuniga 2 marta o'lchang"],
        dailyRulesRu: ["Принимайте антибиотики по часам", "Измеряйте температуру 2 раза в день"],
        dailyRulesEn: ["Take antibiotics strictly on schedule", "Check temperature twice daily"],
        emergencySignsUz: ["Harorat 38.0°C dan oshsa", "Qorin pastida kuchli og'riq bo'lsa"],
        emergencySignsRu: ["Температура выше 38.0°C", "Сильная боль внизу живота"],
        emergencySignsEn: ["Fever >38.0°C", "Severe lower abdominal pain"],
      } satisfies PatientGuide),
      scheduledWindowStart: hoursFrom(dilfuzaDischargeTime, 14),
      scheduledWindowEnd: hoursFrom(dilfuzaDischargeTime, 16),
      dischargedAt: dilfuzaDischargeTime,
      slaDeadlineAt: hoursFrom(dilfuzaDischargeTime, 24),
      escalationLevel: 1,
      patientOtpCode: "7315",
      aiAgentTraceJson: JSON.stringify([
        {
          step: 1,
          agentName: "EHR & Lab Synthesis Agent",
          toolCalled: "analyze_inpatient_ehr_and_labs",
          durationMs: 29,
          status: "COMPLETED",
          summary: "Risk Score 76/100 (O85.0 Endometritis, WBC 16.8, CRP 68).",
          structuredOutput: { post_discharge_risk_score: 76 },
        },
        {
          step: 2,
          agentName: "Territorial Routing & Conflict Agent",
          toolCalled: "route_polyclinic_and_book_24h_slot",
          durationMs: 21,
          status: "COMPLETED",
          summary: "Routed Davlatobod, Namangan -> Dr. Sardorbek Mirzayev (OP-03).",
          structuredOutput: { doctor: "Dr. Sardorbek Mirzayev" },
        },
        {
          step: 3,
          agentName: "Clinical Checklist & Patient Guide Agent",
          toolCalled: "generate_uz_checklist_and_patient_guide",
          durationMs: 25,
          status: "COMPLETED",
          summary: "Generated sepsis & endometritis 5-item checklist in Uzbek.",
          structuredOutput: { checklist_items: 5 },
        },
        {
          step: 4,
          agentName: "Autonomous SLA Escalation & Triage Agent",
          toolCalled: "evaluate_12h_sla_threshold",
          durationMs: 16,
          status: "ESCALATED",
          summary: "12h SLA threshold crossed (13.5h elapsed) -> Yellow warning dispatched to Dr. Sardorbek Mirzayev.",
          structuredOutput: { escalation_level: 1, status: "ESCALATED_12H" },
        },
      ] satisfies AgentTraceStep[]),
      notificationLogJson: JSON.stringify([
        {
          id: "notif-dilfuza-12h",
          channel: "TELEGRAM",
          recipientName: familyDocNamangan.fullName,
          recipientRole: "FAMILY_MD",
          recipientHandle: "@dr_sardor_namangan",
          message:
            "⚠️ [12 SOAT OGOHLANTIRISH] Bemor Dilfuza Xolmatova (Namangan, Davlatobod) uchun 24 soatlik SLA muddati yarmidan oshdi (13.5 soat)!",
          severity: "WARNING",
          sentAt: hoursAgo(1.5).toISOString(),
        },
      ] satisfies NotificationLogEntry[]),
    },
  });

  slaMemoryQueue.set(dilfuzaCall.id, {
    activeCallId: dilfuzaCall.id,
    patientId: dilfuza.id,
    assignedDoctorId: familyDocNamangan.id,
    slaDeadlineAtMs: dilfuzaCall.slaDeadlineAt.getTime(),
    dischargedAtMs: dilfuzaDischargeTime.getTime(),
    escalationLevel: 1,
    status: "ESCALATED_12H",
  });

  // Invoices for active calls (State Guaranteed Free Patronage Coverage + optional diagnostic)
  await prisma.invoice.createMany({
    data: [
      {
        patientId: zulfiya.id,
        activeCallId: zulfiyaCall.id,
        itemCode: "UZ-PATRONAJ-24H",
        description: "24 soatlik majburiy uy patronaji va oilaviy shifokor ko'rigi",
        category: "STATE_GRANT",
        amountUzs: 450000,
        stateCoveredUzs: 450000,
        patientPayableUzs: 0,
        packageName: "Davlat kafolatlangan tibbiy paket",
        status: "COVERED_BY_STATE",
      },
      {
        patientId: zulfiya.id,
        activeCallId: zulfiyaCall.id,
        itemCode: "UZ-LAB-PORTABLE",
        description: "Uyda ko'chma Gemoglobin va ekspress tahlil",
        category: "PAID_DIAGNOSTIC",
        amountUzs: 95000,
        stateCoveredUzs: 0,
        patientPayableUzs: 95000,
        packageName: "Qo'shimcha uy diagnostikasi",
        status: "PAID",
      },
      {
        patientId: dilfuza.id,
        activeCallId: dilfuzaCall.id,
        itemCode: "UZ-PATRONAJ-24H",
        description: "24 soatlik majburiy uy patronaji (Namangan hududi)",
        category: "STATE_GRANT",
        amountUzs: 450000,
        stateCoveredUzs: 450000,
        patientPayableUzs: 0,
        packageName: "Davlat kafolatlangan tibbiy paket",
        status: "COVERED_BY_STATE",
      },
    ],
  });

  // Initial Audit Logs
  await prisma.auditLog.createMany({
    data: [
      {
        actorId: ovabmuDoc.id,
        actorName: ovabmuDoc.fullName,
        actorRole: ovabmuDoc.role,
        action: "TRIGGER_DISCHARGE",
        resourceType: "Patient",
        resourceId: zulfiya.id,
        ipAddress: "10.14.22.108",
        detailsJson: JSON.stringify({ patientName: zulfiya.fullName, diagnosis: "O72.1" }),
        createdAt: zulfiyaDischargeTime,
      },
      {
        actorId: "agentic-coordinator",
        actorName: "Agentic AI Continuity Coordinator",
        actorRole: "AI_COORDINATOR",
        action: "AI_HANDOFF_CREATED",
        resourceType: "ActiveCall",
        resourceId: zulfiyaCall.id,
        ipAddress: "127.0.0.1",
        detailsJson: JSON.stringify({ riskScore: 86, assignedDoctor: familyDocTashkent.fullName }),
        createdAt: zulfiyaDischargeTime,
      },
      {
        actorId: "system-sla-agent",
        actorName: "Autonomous SLA Escalation Agent",
        actorRole: "SYSTEM_AGENT",
        action: "SLA_ESCALATED",
        resourceType: "ActiveCall",
        resourceId: dilfuzaCall.id,
        ipAddress: "127.0.0.1",
        detailsJson: JSON.stringify({
          patientName: dilfuza.fullName,
          elapsedHours: 13.5,
          newStatus: "ESCALATED_12H",
        }),
        createdAt: hoursAgo(1.5),
      },
      {
        actorId: adminUser.id,
        actorName: adminUser.fullName,
        actorRole: adminUser.role,
        action: "VIEW_EHR",
        resourceType: "AdminComplianceBoard",
        resourceId: "sla-monitor",
        ipAddress: "10.14.22.50",
        detailsJson: JSON.stringify({ note: "Clinical notes redacted for ADMIN_RECEPTION role" }),
        createdAt: hoursAgo(0.5),
      },
    ],
  });
}
