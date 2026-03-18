export type DogSize = "SMALL" | "MEDIUM" | "LARGE";
export type DogGender = "MALE" | "FEMALE";
export type ReservationStatus = "RECEIVED" | "CONFIRMED" | "CANCELLED";
export type CharterStatus =
  | "CONFIRMED"
  | "CANCELLED_FREE"
  | "CANCELLED_50"
  | "CANCELLED_100";

export interface Dog {
  id: string;
  name: string;
  breed: string;
  size: DogSize;
  gender: DogGender;
}

export interface Reservation {
  id: string;
  visitDate: string;
  visitTime: string;
  isWeekday: boolean;
  guestName: string;
  phone: string;
  email: string;
  adultCount: number;
  estimatedFee: number;
  vaccineConfirmed: boolean;
  status: ReservationStatus;
  note?: string;
  dogs: Dog[];
}

export interface CharterReservation {
  id: string;
  visitDate: string;
  startTime: string;
  hours: number;
  charterFee: number;
  adultCount: number;
  estimatedUsageFee: number;
  guestName: string;
  phone: string;
  email: string;
  vaccineConfirmed: boolean;
  policyAgreed: boolean;
  status: CharterStatus;
  note?: string;
  dogs: Dog[];
  reservationNumber?: string;
}

export interface News {
  id: string;
  title: string;
  body?: string;
  published: boolean;
  publishedAt: string;
  /** イベント開催日（お知らせ自体の公開日とは別） */
  eventDate?: string;
}

export interface ClosedDay {
  id?: string;
  date: string;
  reason?: string;
}

export type InquiryType = "massage" | "trainer" | "discdog" | "other";
