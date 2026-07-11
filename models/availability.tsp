import "@typespec/http";

using TypeSpec.Http;

namespace CallCalendar {
  /**
   * Available slot — a free time window for a given event type.
   * Returned by the availability endpoint for the guest calendar UI.
   */
  model AvailableSlot {
    /** Slot start (ISO 8601, UTC). */
    startAt: utcDateTime;

    /** Slot end, based on the event type duration. */
    endAt: utcDateTime;
  }

  /** Query parameters for listing available slots. */
  model AvailabilityQuery {
    /** Event type to compute slots for (required). */
    @query
    eventTypeId: string;

    /**
     * Range start (inclusive). Defaults to start of the current UTC day.
     * Must not be before today.
     */
    @query
    from?: utcDateTime;

    /**
     * Range end (exclusive). Defaults to today + 14 days.
     * Must not exceed the booking window.
     */
    @query
    to?: utcDateTime;
  }
}
