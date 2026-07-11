import "@typespec/openapi3";

using TypeSpec.OpenAPI;

namespace CallCalendar {
  /**
   * Booking — a guest reservation for a specific time slot and event type.
   * Occupancy is global: two bookings cannot share the same start time.
   */
  model Booking {
    id: string;
    eventTypeId: string;

    /** Slot start (ISO 8601, UTC). */
    startAt: utcDateTime;

    /** Slot end, derived from event type duration at booking time. */
    endAt: utcDateTime;

    guestName: string;
    guestEmail: string;
  }

  /** Booking enriched with event type details for the owner upcoming-meetings view. */
  model BookingWithEventType extends Booking {
    eventType: EventType;
  }

  /** Payload for creating a booking (guest). */
  model CreateBookingRequest {
    eventTypeId: string;

    /** Desired slot start; must fall within the 14-day availability window and be free. */
    startAt: utcDateTime;

    guestName: string;

    @format("email")
    guestEmail: string;
  }
}
