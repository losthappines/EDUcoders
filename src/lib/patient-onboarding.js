import { encryptField } from "@/lib/crypto";
export async function activateVerifiedPatientOnboardingTx(tx, params) {
    const patient = await tx.patient.findUnique({
        where: { userId: params.userId },
        include: {
            ehrRecords: { select: { id: true } },
            activeCalls: { select: { id: true } },
        },
    });
    if (!patient)
        return;
    const assignedDoc = (patient.assignedFamilyDoctorId
        ? await tx.user.findFirst({
            where: {
                id: patient.assignedFamilyDoctorId,
                role: "FAMILY_MD",
                verificationStatus: "VERIFIED",
            },
        })
        : null) ??
        (await tx.user.findFirst({
            where: {
                role: "FAMILY_MD",
                polyclinicId: params.polyclinicId,
                verificationStatus: "VERIFIED",
            },
        })) ??
        (await tx.user.findFirst({
            where: { role: "FAMILY_MD", verificationStatus: "VERIFIED" },
        }));
    const dischargingDoc = (await tx.user.findFirst({
        where: { role: "OVABMU_MD", verificationStatus: "VERIFIED" },
    })) ?? assignedDoc;
    const now = new Date();
    await tx.patient.update({
        where: { id: patient.id },
        data: {
            status: "PATRONAGE_ACTIVE",
            dischargedAt: patient.dischargedAt ?? now,
            assignedFamilyDoctorId: assignedDoc?.id ?? patient.assignedFamilyDoctorId,
        },
    });
    if (patient.ehrRecords.length === 0 && dischargingDoc) {
        await tx.ehrRecord.create({
            data: {
                patientId: patient.id,
                authorId: dischargingDoc.id,
                recordType: "DISCHARGE_EPIKRIZ",
                diagnosisIcd10: "Z39.2",
                diagnosisText: "Tug'ruqdan keyingi rejali patronaj kuzatuvi va salomatlik monitoringi",
                severity: "MODERATE",
                clinicalNotesEncrypted: encryptField("Bemor portal orqali ro'yxatdan o'tdi va administrator tomonidan tasdiqlandi. 24 soatlik hududiy oilaviy shifokor patronaj ko'rigi faollashtirildi."),
                vitalsJson: JSON.stringify({
                    systolicBp: 120,
                    diastolicBp: 80,
                    heartRate: 78,
                    tempC: 36.6,
                    spo2: 98,
                    respRate: 18,
                    recordedAt: now.toISOString(),
                    phase: "INPATIENT_PRE_DISCHARGE",
                }),
                proceduresJson: JSON.stringify([
                    "Administrator tasdig'i va birlamchi patronaj profilini faollashtirish",
                ]),
            },
        });
    }
    if (patient.activeCalls.length === 0 && assignedDoc && dischargingDoc) {
        const slaDeadline = new Date(now.getTime() + 24 * 3600 * 1000);
        const winStart = new Date(now.getTime() + 4 * 3600 * 1000);
        const winEnd = new Date(now.getTime() + 6 * 3600 * 1000);
        const otp = String(Math.floor(1000 + Math.random() * 9000));
        const guide = {
            summaryUz: `Hurmatli ${params.fullName}, hisobingiz tasdiqlandi va shaxsiy patronaj kabinetingiz faollashtirildi. Hududiy shifokoringiz ${assignedDoc.fullName} bilan 24 soatlik aloqa o'rnatildi.`,
            summaryRu: `Уважаемая ${params.fullName}, ваш аккаунт подтвержден, личный кабинет патронажа активирован. Назначен семейный врач ${assignedDoc.fullName}.`,
            summaryEn: `Welcome ${params.fullName}. Your account has been verified and your personal patronage portal is active with assigned family doctor ${assignedDoc.fullName}.`,
            dailyRulesUz: [
                "Kuniga 1 marta simptomlar va qon bosimingizni portalga kiriting",
                "Shifokor tavsiya qilgan dorilarni vaqtida qabul qiling",
                "Yetarli suv iching va dam olish rejimiga rioya qiling",
            ],
            dailyRulesRu: [
                "Ежедневно вносите показатели давления и симптомов",
                "Принимайте назначенные препараты по графику",
                "Соблюдайте питьевой режим и отдых",
            ],
            dailyRulesEn: [
                "Log your daily blood pressure and symptoms in the check-in form",
                "Take prescribed medications on schedule",
                "Maintain hydration and adequate rest",
            ],
            emergencySignsUz: [
                "Qon bosimi 140/90 mmHg dan oshsa yoki kuchli bosh og'rig'i bo'lsa",
                "Tana harorati 38.0°C dan ko'tarilsa",
                "Kuchli qon ketishi yoki hushdan ketish holati sezilsa",
            ],
            emergencySignsRu: [
                "Повышение АД выше 140/90 мм рт. ст. или сильная головная боль",
                "Температура тела выше 38.0°C",
                "Обильное кровотечение или резкая слабость",
            ],
            emergencySignsEn: [
                "Blood pressure > 140/90 mmHg or severe headache",
                "Fever above 38.0°C",
                "Heavy bleeding or severe dizziness",
            ],
        };
        await tx.activeCall.create({
            data: {
                patientId: patient.id,
                dischargedById: dischargingDoc.id,
                assignedDoctorId: assignedDoc.id,
                polyclinicName: params.polyclinicName,
                district: params.district,
                status: "SCHEDULED",
                priority: "NORMAL",
                riskScore: 42,
                redFlagsJson: JSON.stringify([
                    "24 soatlik birlamchi patronaj ko'rigi rejalashtirilgan",
                ]),
                checklistJson: JSON.stringify([
                    {
                        id: "chk-init-vitals",
                        titleUz: "AQB, puls va tana haroratini o'lchash",
                        titleRu: "Измерение АД, пульса и температуры",
                        titleEn: "Measure BP, pulse, and temperature",
                        category: "VITALS",
                        checked: false,
                    },
                    {
                        id: "chk-init-consult",
                        titleUz: "Umumiy ahvol va shikoyatlarni baholash",
                        titleRu: "Оценка общего состояния и жалоб",
                        titleEn: "Assess overall recovery and symptoms",
                        category: "PHYSICAL_EXAM",
                        checked: false,
                    },
                ]),
                patientGuideJson: JSON.stringify(guide),
                scheduledWindowStart: winStart,
                scheduledWindowEnd: winEnd,
                dischargedAt: now,
                slaDeadlineAt: slaDeadline,
                escalationLevel: 0,
                patientOtpCode: otp,
                aiAgentTraceJson: JSON.stringify([]),
                notificationLogJson: JSON.stringify([]),
            },
        });
    }
}
