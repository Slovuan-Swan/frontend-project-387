import "@typespec/http";
import "@typespec/openapi3";

using TypeSpec.Http;
using TypeSpec.OpenAPI;

namespace CallCalendar {
  /**
   * Owner (admin) API — no authentication in v1; single predefined owner profile.
   * Base path: /admin
   */
  @route("/admin")
  @tag("Admin")
  interface Admin {
    /** List all event types created by the owner. */
    @route("/event-types")
    @get
    listEventTypes(): EventType[];

    /** Create a new event type. Owner supplies the id. */
    @route("/event-types")
    @post
    createEventType(@body body: CreateEventTypeRequest):
      | EventType
      | ErrorResponse;

    /** Get one event type by id. */
    @route("/event-types/{id}")
    @get
    getEventType(@path id: string): EventType | ErrorResponse;

    /** Update an event type. */
    @route("/event-types/{id}")
    @patch
    updateEventType(
      @path id: string,
      @body body: UpdateEventTypeRequest,
    ): EventType | ErrorResponse;

    /** Delete an event type. */
    @route("/event-types/{id}")
    @delete
    deleteEventType(@path id: string): void | ErrorResponse;

    /**
     * Upcoming meetings — all bookings across event types, sorted by start time.
     * Optional filter: only bookings starting at or after `from` (defaults to now).
     */
    @route("/bookings")
    @get
    listUpcomingBookings(@query from?: utcDateTime): BookingWithEventType[];
  }
}
