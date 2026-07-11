import "@typespec/openapi3";

using TypeSpec.OpenAPI;

namespace CallCalendar {
  /**
   * Event type — a bookable meeting kind defined by the calendar owner.
   * Used on the guest booking page (title, description, duration) and when creating bookings.
   */
  model EventType {
    /** Unique identifier chosen by the owner when creating the type. */
    id: string;

    /** Display name shown to guests and on the owner dashboard. */
    title: string;

    /** Longer description for the guest booking page. */
    description: string;

    /** Meeting length in minutes; defines slot duration for this type. */
    @minValue(1)
    durationMinutes: int32;
  }

  /** Payload for creating a new event type (owner). */
  model CreateEventTypeRequest {
    id: string;
    title: string;
    description: string;

    @minValue(1)
    durationMinutes: int32;
  }

  /** Payload for updating an existing event type (owner). */
  model UpdateEventTypeRequest {
    title?: string;
    description?: string;

    @minValue(1)
    durationMinutes?: int32;
  }
}
