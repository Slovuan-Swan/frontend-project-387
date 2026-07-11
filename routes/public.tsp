import "@typespec/http";
import "@typespec/openapi3";

using TypeSpec.Http;
using TypeSpec.OpenAPI;

namespace CallCalendar {
  /**
   * Public (guest) API — no registration or login.
   * Base path: /
   */
  @tag("Public")
  interface Public {
    /**
     * Booking types page — list event types with title, description, and duration.
     */
    @route("/event-types")
    @get
    listEventTypes(): EventType[];

    /** Event type details before opening the slot calendar. */
    @route("/event-types/{id}")
    @get
    getEventType(@path id: string): EventType | ErrorResponse;

    /**
     * Free slots for the guest calendar (default window: today .. today+14 days).
     * Slots respect global occupancy: any existing booking blocks that start time.
     */
    @route("/availability")
    @get
    getAvailability(...AvailabilityQuery): AvailableSlot[] | ErrorResponse;

    /**
     * Create a booking on a selected free slot.
     * Returns 409 if the slot is already taken; 400 if outside the 14-day window.
     */
    @route("/bookings")
    @post
    createBooking(@body body: CreateBookingRequest): Booking | ErrorResponse;
  }
}
