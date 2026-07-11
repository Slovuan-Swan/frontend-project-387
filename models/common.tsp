import "@typespec/http";
import "@typespec/openapi3";

using TypeSpec.Http;
using TypeSpec.OpenAPI;

namespace CallCalendar {
  /** Shared error payload for failed requests. */
  @error
  model ErrorResponse {
    /** Machine-readable error code. */
    code: ErrorCode;

    /** Human-readable error description. */
    message: string;
  }

  /** Standard error codes returned by the API. */
  enum ErrorCode {
    /** Request body or query parameters failed validation. */
    validation_error: "validation_error",

    /** Referenced resource was not found. */
    not_found: "not_found",

    /** The requested time slot is already booked. */
    slot_unavailable: "slot_unavailable",

    /** Booking is outside the allowed 14-day window. */
    booking_window_exceeded: "booking_window_exceeded",
  }

  /** Number of days ahead (from today) that guests may book. */
  const BOOKING_WINDOW_DAYS: int32 = 14;
}
