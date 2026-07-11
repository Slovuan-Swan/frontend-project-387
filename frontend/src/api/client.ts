import {
  ApiError,
  type AvailableSlot,
  type Booking,
  type BookingWithEventType,
  type CreateBookingRequest,
  type CreateEventTypeRequest,
  type ErrorResponse,
  type EventType,
  type UpdateEventTypeRequest,
} from "@/types/api";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api";

async function parseError(response: Response): Promise<ApiError> {
  try {
    const body = (await response.json()) as ErrorResponse;
    return new ApiError(response.status, body.message, body.code);
  } catch {
    return new ApiError(response.status, response.statusText);
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw await parseError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const publicApi = {
  listEventTypes: () => request<EventType[]>("/event-types"),

  getEventType: (id: string) => request<EventType>(`/event-types/${id}`),

  getAvailability: (params: {
    eventTypeId: string;
    from?: string;
    to?: string;
  }) => {
    const search = new URLSearchParams({ eventTypeId: params.eventTypeId });
    if (params.from) search.set("from", params.from);
    if (params.to) search.set("to", params.to);
    return request<AvailableSlot[]>(`/availability?${search.toString()}`);
  },

  createBooking: (body: CreateBookingRequest) =>
    request<Booking>("/bookings", {
      method: "POST",
      body: JSON.stringify(body),
    }),
};

export const adminApi = {
  listEventTypes: () => request<EventType[]>("/admin/event-types"),

  createEventType: (body: CreateEventTypeRequest) =>
    request<EventType>("/admin/event-types", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  updateEventType: (id: string, body: UpdateEventTypeRequest) =>
    request<EventType>(`/admin/event-types/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  deleteEventType: (id: string) =>
    request<void>(`/admin/event-types/${id}`, { method: "DELETE" }),

  listUpcomingBookings: (from?: string) => {
    const query = from ? `?from=${encodeURIComponent(from)}` : "";
    return request<BookingWithEventType[]>(`/admin/bookings${query}`);
  },
};
