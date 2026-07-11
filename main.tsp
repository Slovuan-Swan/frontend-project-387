/**
 * Call Calendar API — Design First contract.
 *
 * Roles:
 * - Owner: single predefined calendar profile (no auth). Manages event types and views upcoming bookings.
 * - Guest: books slots without registration. Reads event types, checks availability, creates bookings.
 *
 * Booking rules:
 * - One booking per time slot globally (across all event types).
 * - Availability window: 14 days from the current date (inclusive).
 */

import "@typespec/http";
import "@typespec/openapi3";

import "./models/common.tsp";
import "./models/event-type.tsp";
import "./models/booking.tsp";
import "./models/availability.tsp";
import "./routes/admin.tsp";
import "./routes/public.tsp";

using TypeSpec.Http;
using TypeSpec.OpenAPI;

@service(#{ title: "Call Calendar API" })
@server("http://localhost:3000", "Local development")
@server("https://api.example.com", "Production")
namespace CallCalendar;
