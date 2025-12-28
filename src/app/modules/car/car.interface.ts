import { Types } from "mongoose";

export enum AVAILABLE_DAYS {
  SATURDAY = "SATURDAY",
  SUNDAY = "SUNDAY",
  MONDAY = "MONDAY",
  TUESDAY = "TUESDAY",
  WEDNESDAY = "WEDNESDAY",
  THURSDAY = "THURSDAY",
  FRIDAY = "FRIDAY",
}

export enum FUEL_TYPE {
  PETROL = "PETROL",
  DISEL = "DISEL",
  ELECTRIC = "ELECTRIC",
  HYBRID = "HYBRID",
}

export enum TRANSMISSION {
  MANUAL = "MANUAL",
  AUTOMATIC = "AUTOMATIC",
}

export enum CAR_VERIFICATION_STATUS {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export interface IBlockedDate {
  date: Date;
  reason?: string;
}

export interface ICar {
  userId: Types.ObjectId;
  brand: string;
  model: string;
  year: number;
  transmission: TRANSMISSION;
  fuelType: FUEL_TYPE;
  airConditioning: boolean;
  gpsNavigation: boolean;
  mileage: string;
  bluetooth: boolean;
  seatNumber: number;
  color: string;
  about: string;
  verificationStatus: CAR_VERIFICATION_STATUS;
  shortDescription: string;
  licensePlate: string;
  carRegistrationPaperFrontPic: string;
  carRegistrationPaperBackPic: string;
  images: string[];
  dailyPrice: number;
  hourlyPrice?: number;
  minimumTripDuration: number; // in hours
  withDriver: boolean;
  city: string;
  pickupPoint: { type: "Point"; coordinates: [number, number] };
  availableDays: AVAILABLE_DAYS[];
  availableHours: string[];
  facilities: string[];
  blockedDates?: IBlockedDate[];
  defaultStartTime?: string; // e.g., "09:00"
  defaultEndTime?: string; // e.g., "21:00"
  isActive: boolean;
}
