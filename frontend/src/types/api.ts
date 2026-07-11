export type ErrorCode =
  | "validation_error"
  | "not_found"
  | "slot_unavailable"
  | "booking_window_exceeded";

export interface ErrorResponse {
  code: ErrorCode;
  message: string;
}

export interface EventType {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
}

export interface CreateEventTypeRequest {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
}

export interface UpdateEventTypeRequest {
  title?: string;
  description?: string;
  durationMinutes?: number;
}

export interface Booking {
  id: string;
  eventTypeId: string;
  startAt: string;
  endAt: string;
  guestName: string;
  guestEmail: string;
}

export interface BookingWithEventType extends Booking {
  eventType: EventType;
}

export interface CreateBookingRequest {
  eventTypeId: string;
  startAt: string;
  guestName: string;
  guestEmail: string;
}

export interface AvailableSlot {
  startAt: string;
  endAt: string;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: ErrorCode,
  ) {
    super(message);
    this.name = "ApiError";
  }
}
