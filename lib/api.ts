/**
 * API通信ヘルパー
 * DBカラム名（snake_case）とフロント型（camelCase）の変換を一元管理
 */

import type {
  Reservation,
  CharterReservation,
  News,
  ClosedDay,
  Dog,
} from "@/types";

// --- DB行 → フロント型への変換 ---

interface DbDog {
  id?: string;
  name: string;
  breed: string;
  size: string;
  gender: string;
}

interface DbReservationRow {
  id: string;
  date: string;
  time: string;
  adult_count: number;
  dogs: DbDog[];
  representative_name: string;
  phone: string;
  email: string;
  vaccine_confirmed: boolean;
  status: string;
  note?: string;
  estimated_fee?: number;
  is_weekday?: boolean;
  created_at: string;
}

interface DbCharterRow {
  id: string;
  reservation_number: string;
  date: string;
  start_time: string;
  duration: number;
  adult_count: number;
  dogs: DbDog[];
  representative_name: string;
  phone: string;
  email: string;
  vaccine_confirmed: boolean;
  cancel_policy_agreed: boolean;
  status: string;
  note?: string;
  charter_fee?: number;
  estimated_usage_fee?: number;
  created_at: string;
}

interface DbNewsRow {
  id: string;
  title: string;
  content?: string;
  published: boolean;
  event_date?: string;
  created_at: string;
  updated_at?: string;
}

interface DbClosedDayRow {
  id: string;
  date: string;
  reason?: string;
  created_at: string;
}

function mapDog(d: DbDog, index: number): Dog {
  return {
    id: d.id ?? `dog_${index}`,
    name: d.name,
    breed: d.breed,
    size: d.size as Dog["size"],
    gender: d.gender as Dog["gender"],
  };
}

export function mapReservation(row: DbReservationRow): Reservation {
  return {
    id: row.id,
    visitDate: row.date,
    visitTime: row.time,
    isWeekday: row.is_weekday ?? true,
    guestName: row.representative_name,
    phone: row.phone,
    email: row.email,
    adultCount: row.adult_count,
    estimatedFee: row.estimated_fee ?? 0,
    vaccineConfirmed: row.vaccine_confirmed,
    status: row.status as Reservation["status"],
    note: row.note ?? "",
    dogs: Array.isArray(row.dogs) ? row.dogs.map(mapDog) : [],
  };
}

export function mapCharter(row: DbCharterRow): CharterReservation {
  return {
    id: row.id,
    visitDate: row.date,
    startTime: row.start_time,
    hours: row.duration,
    charterFee: row.charter_fee ?? 0,
    adultCount: row.adult_count,
    estimatedUsageFee: row.estimated_usage_fee ?? 0,
    guestName: row.representative_name,
    phone: row.phone,
    email: row.email,
    vaccineConfirmed: row.vaccine_confirmed,
    policyAgreed: row.cancel_policy_agreed,
    status: row.status as CharterReservation["status"],
    note: row.note ?? "",
    dogs: Array.isArray(row.dogs) ? row.dogs.map(mapDog) : [],
    reservationNumber: row.reservation_number,
  };
}

export function mapNews(row: DbNewsRow): News {
  return {
    id: row.id,
    title: row.title,
    body: row.content,
    published: row.published,
    publishedAt: row.created_at.split("T")[0],
    eventDate: row.event_date,
  };
}

export function mapClosedDay(row: DbClosedDayRow): ClosedDay {
  return {
    id: row.id,
    date: row.date,
    reason: row.reason,
  };
}

// --- fetch ヘルパー ---

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function fetchApi<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.error ?? `HTTP ${res.status}`);
  }
  return res.json();
}

// --- 来場連絡 API ---

export async function fetchReservations(date?: string): Promise<Reservation[]> {
  const url = date ? `/api/reservations?date=${date}` : "/api/reservations";
  const rows = await fetchApi<DbReservationRow[]>(url);
  return rows.map(mapReservation);
}

export async function createReservation(payload: Record<string, unknown>): Promise<Reservation> {
  const row = await fetchApi<DbReservationRow>("/api/reservations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return mapReservation(row);
}

export async function updateReservationStatus(id: string, status: string): Promise<Reservation> {
  const row = await fetchApi<DbReservationRow>("/api/reservations", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, status }),
  });
  return mapReservation(row);
}

// --- 貸し切り API ---

export async function fetchCharters(date?: string): Promise<CharterReservation[]> {
  const url = date ? `/api/charters?date=${date}` : "/api/charters";
  const rows = await fetchApi<DbCharterRow[]>(url);
  return rows.map(mapCharter);
}

export async function createCharter(payload: Record<string, unknown>): Promise<CharterReservation> {
  const row = await fetchApi<DbCharterRow>("/api/charters", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return mapCharter(row);
}

export async function updateCharterStatus(id: string, status: string): Promise<CharterReservation> {
  const row = await fetchApi<DbCharterRow>("/api/charters", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, status }),
  });
  return mapCharter(row);
}

// --- お知らせ API ---

export async function fetchNews(publishedOnly?: boolean): Promise<News[]> {
  const url = publishedOnly ? "/api/news?published=true" : "/api/news";
  const rows = await fetchApi<DbNewsRow[]>(url);
  return rows.map(mapNews);
}

export async function createNews(payload: { title: string; content?: string }): Promise<News> {
  const row = await fetchApi<DbNewsRow>("/api/news", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return mapNews(row);
}

export async function updateNews(id: string, updates: Record<string, unknown>): Promise<News> {
  const row = await fetchApi<DbNewsRow>("/api/news", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, ...updates }),
  });
  return mapNews(row);
}

export async function deleteNews(id: string): Promise<void> {
  await fetchApi(`/api/news?id=${id}`, { method: "DELETE" });
}

// --- 臨時休業日 API ---

export async function fetchClosedDays(): Promise<ClosedDay[]> {
  const rows = await fetchApi<DbClosedDayRow[]>("/api/closed-days");
  return rows.map(mapClosedDay);
}

export async function createClosedDay(payload: { date: string; reason?: string }): Promise<ClosedDay> {
  const row = await fetchApi<DbClosedDayRow>("/api/closed-days", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return mapClosedDay(row);
}

export async function deleteClosedDay(id: string): Promise<void> {
  await fetchApi(`/api/closed-days?id=${id}`, { method: "DELETE" });
}
