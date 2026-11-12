import type { Level, MemberStatus, Purchase, Tier } from "@/lib/domain";

export type StoredMember = {
  code: string;
  fullName: string;
  email: string;
  phone: string;
  tier: Tier;
  cancelled: boolean;
  issuedAt: string;
  validUntil: string;
  points: number;
  cashbackBalanceCents: number;
};

type MockStore = {
  members: StoredMember[];
  levels: Level[];
  purchases: Purchase[];
};

const dayInMilliseconds = 24 * 60 * 60 * 1000;

function daysFromNow(days: number): string {
  return new Date(Date.now() + days * dayInMilliseconds).toISOString();
}

function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

function createStore(): MockStore {
  const members: StoredMember[] = [
    { code: "MP-4F7K2", fullName: "Laura Méndez", email: "laura.mendez@correo.com", phone: "664 123 4567", tier: "gold", cancelled: false, issuedAt: daysFromNow(-240), validUntil: daysFromNow(125), points: 1250, cashbackBalanceCents: 12000 },
    { code: "MP-8Q2LM", fullName: "Carlos Ibarra", email: "carlos.ibarra@correo.com", phone: "664 222 1010", tier: "silver", cancelled: false, issuedAt: daysFromNow(-200), validUntil: daysFromNow(165), points: 640, cashbackBalanceCents: 0 },
    { code: "MP-3H9TX", fullName: "Daniela Ruiz", email: "daniela.ruiz@correo.com", phone: "664 333 4545", tier: "bronze", cancelled: false, issuedAt: daysFromNow(-360), validUntil: daysFromNow(5), points: 120, cashbackBalanceCents: 0 },
    { code: "MP-7B5WC", fullName: "Andrés Soto", email: "andres.soto@correo.com", phone: "664 444 9090", tier: "onyx", cancelled: false, issuedAt: daysFromNow(-280), validUntil: daysFromNow(85), points: 3980, cashbackBalanceCents: 21500 },
    { code: "MP-2N8RD", fullName: "Mariana López", email: "mariana.lopez@correo.com", phone: "664 555 3030", tier: "gold", cancelled: false, issuedAt: daysFromNow(-178), validUntil: daysFromNow(187), points: 1015, cashbackBalanceCents: 4200 },
    { code: "MP-9T4VK", fullName: "Jorge Navarro", email: "jorge.navarro@correo.com", phone: "664 666 7878", tier: "silver", cancelled: false, issuedAt: daysFromNow(-353), validUntil: daysFromNow(12), points: 410, cashbackBalanceCents: 1500 },
    { code: "MP-5X1QE", fullName: "Paola Castillo", email: "paola.castillo@correo.com", phone: "664 777 1212", tier: "bronze", cancelled: true, issuedAt: daysFromNow(-435), validUntil: daysFromNow(-70), points: 60, cashbackBalanceCents: 0 },
    { code: "MP-6M3ZA", fullName: "Ricardo Peña", email: "ricardo.pena@correo.com", phone: "664 888 5656", tier: "silver", cancelled: false, issuedAt: daysFromNow(-128), validUntil: daysFromNow(237), points: 530, cashbackBalanceCents: 800 },
    { code: "MP-1C6YN", fullName: "Marcos Vela", email: "marcos.vela@correo.com", phone: "664 999 2323", tier: "gold", cancelled: false, issuedAt: daysFromNow(-347), validUntil: daysFromNow(18), points: 1130, cashbackBalanceCents: 0 },
    { code: "MP-8D2PW", fullName: "Elena Cruz", email: "elena.cruz@correo.com", phone: "664 101 4040", tier: "silver", cancelled: false, issuedAt: daysFromNow(-344), validUntil: daysFromNow(21), points: 470, cashbackBalanceCents: 0 },
    { code: "MP-5R9HJ", fullName: "Hugo Salas", email: "hugo.salas@correo.com", phone: "664 202 6060", tier: "bronze", cancelled: false, issuedAt: daysFromNow(-338), validUntil: daysFromNow(27), points: 90, cashbackBalanceCents: 0 },
    { code: "MP-3W7BT", fullName: "Sofía Lara", email: "sofia.lara@correo.com", phone: "664 303 8080", tier: "bronze", cancelled: false, issuedAt: daysFromNow(-60), validUntil: daysFromNow(305), points: 45, cashbackBalanceCents: 0 },
  ];

  const levels: Level[] = [
    { tier: "bronze", minPoints: 0, benefits: { discountPercent: 5, pointsPerTenPesos: 1, cashbackPercent: 0 } },
    { tier: "silver", minPoints: 400, benefits: { discountPercent: 10, pointsPerTenPesos: 1, cashbackPercent: 1 } },
    { tier: "gold", minPoints: 1000, benefits: { discountPercent: 15, pointsPerTenPesos: 1, cashbackPercent: 3 } },
    { tier: "onyx", minPoints: 1500, benefits: { discountPercent: 20, pointsPerTenPesos: 2, cashbackPercent: 5 } },
  ];

  const seeds = [
    { id: "seed-1", memberCode: "MP-4F7K2", concept: "Consumo en mesa", amountCents: 42000, registerName: "Caja principal", hours: 3 },
    { id: "seed-2", memberCode: "MP-8Q2LM", concept: "Café y pan", amountCents: 18500, registerName: "Caja terraza", hours: 5 },
    { id: "seed-3", memberCode: "MP-7B5WC", concept: "Consumo en mesa", amountCents: 124000, registerName: "Caja principal", hours: 20 },
    { id: "seed-4", memberCode: "MP-2N8RD", concept: "Pastel de cumpleaños", amountCents: 89000, registerName: "Caja principal", hours: 22 },
    { id: "seed-5", memberCode: "MP-6M3ZA", concept: "Café y pan", amountCents: 9600, registerName: "Caja terraza", hours: 50 },
    { id: "seed-6", memberCode: "MP-9T4VK", concept: "Consumo en mesa", amountCents: 31000, registerName: "Caja 2", hours: 52 },
    { id: "seed-7", memberCode: "MP-3H9TX", concept: "Café y pan", amountCents: 15000, registerName: "Caja principal", hours: 76 },
    { id: "seed-8", memberCode: "MP-4F7K2", concept: "Café y pan", amountCents: 13500, registerName: "Caja terraza", hours: 100 },
    { id: "seed-9", memberCode: "MP-4F7K2", concept: "Pastel de cumpleaños", amountCents: 89000, registerName: "Caja principal", hours: 240 },
    { id: "seed-10", memberCode: "MP-4F7K2", concept: "Consumo en mesa", amountCents: 61000, registerName: "Caja principal", hours: 360 },
    { id: "seed-11", memberCode: "MP-1C6YN", concept: "Consumo en mesa", amountCents: 28000, registerName: "Caja 2", hours: 120 },
    { id: "seed-12", memberCode: "MP-8D2PW", concept: "Café y pan", amountCents: 12000, registerName: "Caja terraza", hours: 150 },
  ];

  const purchases: Purchase[] = seeds.map((seed) => {
    const member = members.find((item) => item.code === seed.memberCode)!;
    const benefits = levels.find((level) => level.tier === member.tier)!.benefits;
    const discountCents = Math.round((seed.amountCents * benefits.discountPercent) / 100);
    const discounted = seed.amountCents - discountCents;

    return {
      id: seed.id,
      memberCode: member.code,
      memberName: member.fullName,
      tier: member.tier,
      concept: seed.concept,
      createdAt: hoursAgo(seed.hours),
      registerName: seed.registerName,
      discountPercent: benefits.discountPercent,
      breakdown: {
        amountCents: seed.amountCents,
        discountCents,
        cashbackAppliedCents: 0,
        totalCents: discounted,
        pointsEarned: Math.floor(discounted / 1000) * benefits.pointsPerTenPesos,
        cashbackEarnedCents: Math.round((discounted * benefits.cashbackPercent) / 100),
      },
    };
  });

  return { members, levels, purchases };
}

const globalStore = globalThis as typeof globalThis & { mockStore?: MockStore };

export function mockStore(): MockStore {
  return (globalStore.mockStore ??= createStore());
}

export function resolveMemberStatus(member: StoredMember): MemberStatus {
  if (member.cancelled) return "cancelled";
  return new Date(member.validUntil).getTime() < Date.now() ? "expired" : "active";
}

const thirtyDaysInMilliseconds = 30 * 24 * 60 * 60 * 1000;

export function isExpiringSoon(member: StoredMember): boolean {
  if (resolveMemberStatus(member) !== "active") return false;
  return new Date(member.validUntil).getTime() - Date.now() <= thirtyDaysInMilliseconds;
}
