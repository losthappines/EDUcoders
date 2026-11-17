export function buildFhirR4Bundle(params) {
    const { patient, ehr, activeCall, prescriptions } = params;
    const [familyName, ...givenParts] = patient.fullName.split(" ");
    const givenName = givenParts.join(" ") || patient.fullName;
    const patientResourceId = `Patient/${patient.id}`;
    const encounterResourceId = `Encounter/enc-${activeCall.id}`;
    const carePlanResourceId = `CarePlan/cp-${activeCall.id}`;
    const entries = [
        {
            fullUrl: `urn:uuid:${patient.id}`,
            resource: {
                resourceType: "Patient",
                id: patient.id,
                meta: {
                    profile: ["http://fhir.ssv.uz/StructureDefinition/uz-core-patient"],
                },
                identifier: [
                    {
                        system: "http://id.gov.uz/jshshir-masked",
                        value: patient.jshshirMasked,
                    },
                ],
                active: true,
                name: [
                    {
                        use: "official",
                        family: familyName,
                        given: [givenName],
                        text: patient.fullName,
                    },
                ],
                telecom: [{ system: "phone", value: patient.phone, use: "mobile" }],
                gender: "female",
                birthDate: patient.dateOfBirth,
                address: [
                    {
                        use: "home",
                        text: `${patient.district}, ${patient.mahalla}, ${patient.address}`,
                        district: patient.district,
                        country: "UZ",
                    },
                ],
            },
        },
        {
            fullUrl: `urn:uuid:enc-${activeCall.id}`,
            resource: {
                resourceType: "Encounter",
                id: `enc-${activeCall.id}`,
                status: "finished",
                class: {
                    system: "http://terminology.hl7.org/CodeSystem/v3-ActCode",
                    code: "IMP",
                    display: "inpatient encounter (OvaBMU)",
                },
                subject: { reference: patientResourceId, display: patient.fullName },
                participant: [
                    {
                        individual: { display: activeCall.dischargedByName },
                    },
                ],
                period: {
                    start: ehr?.createdAt.toISOString() ?? activeCall.dischargedAt.toISOString(),
                    end: activeCall.dischargedAt.toISOString(),
                },
                reasonCode: ehr
                    ? [
                        {
                            coding: [
                                {
                                    system: "http://hl7.org/fhir/sid/icd-10",
                                    code: ehr.diagnosisIcd10,
                                    display: ehr.diagnosisText,
                                },
                            ],
                        },
                    ]
                    : [],
            },
        },
        {
            fullUrl: `urn:uuid:cp-${activeCall.id}`,
            resource: {
                resourceType: "CarePlan",
                id: `cp-${activeCall.id}`,
                status: activeCall.status === "COMPLETED" ? "completed" : "active",
                intent: "order",
                title: "OvaBMU 24-Hour Post-Discharge Maternal Patronage Plan",
                description: `AI Risk Score: ${activeCall.riskScore}/100. Red Flags: ${activeCall.redFlags.join("; ")}`,
                subject: { reference: patientResourceId, display: patient.fullName },
                encounter: { reference: encounterResourceId },
                period: {
                    start: activeCall.dischargedAt.toISOString(),
                    end: activeCall.slaDeadlineAt.toISOString(),
                },
                activity: activeCall.checklist.map((item) => ({
                    detail: {
                        kind: "Task",
                        code: { text: item.category },
                        status: item.checked ? "completed" : "not-started",
                        description: item.titleUz,
                    },
                })),
            },
        },
        {
            fullUrl: `urn:uuid:task-${activeCall.id}`,
            resource: {
                resourceType: "Task",
                id: `task-${activeCall.id}`,
                status: activeCall.status === "COMPLETED" ? "completed" : "accepted",
                intent: "order",
                priority: activeCall.priority === "CRITICAL" ? "stat" : "urgent",
                code: {
                    coding: [
                        {
                            system: "http://ssv.uz/fhir/CodeSystem/patronaj",
                            code: "AKTIV_CHAQIRUV_24H",
                            display: "Mandatory 24-Hour Family Doctor Home Visit",
                        },
                    ],
                },
                for: { reference: patientResourceId, display: patient.fullName },
                encounter: { reference: encounterResourceId },
                basedOn: [{ reference: carePlanResourceId }],
                requester: { display: activeCall.dischargedByName },
                owner: {
                    display: `${activeCall.assignedDoctorName} (${activeCall.polyclinicName})`,
                },
                executionPeriod: {
                    start: activeCall.scheduledWindowStart.toISOString(),
                    end: activeCall.scheduledWindowEnd.toISOString(),
                },
                restriction: {
                    period: {
                        end: activeCall.slaDeadlineAt.toISOString(),
                    },
                },
            },
        },
        ...prescriptions.map((rx) => ({
            fullUrl: `urn:uuid:med-${rx.id}`,
            resource: {
                resourceType: "MedicationRequest",
                id: `med-${rx.id}`,
                status: "active",
                intent: "order",
                medicationCodeableConcept: {
                    text: `${rx.medicationName} ${rx.dosage}`,
                },
                subject: { reference: patientResourceId, display: patient.fullName },
                encounter: { reference: encounterResourceId },
                dosageInstruction: [
                    {
                        text: `${rx.frequency} for ${rx.durationDays} days — ${rx.instructionsUz}`,
                    },
                ],
            },
        })),
    ];
    return {
        resourceType: "Bundle",
        id: `bundle-ovabmu-${activeCall.id}`,
        type: "collection",
        timestamp: new Date().toISOString(),
        meta: {
            tag: [
                {
                    system: "http://ssv.uz/fhir/e-health",
                    code: "OVABMU-PATRONAJ-R4",
                    display: "Uzbekistan National e-Health Continuity of Care",
                },
            ],
        },
        entry: entries,
    };
}
