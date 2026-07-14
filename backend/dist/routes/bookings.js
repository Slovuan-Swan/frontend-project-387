"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const store_1 = require("../store");
const date_fns_1 = require("date-fns");
const router = (0, express_1.Router)();
router.post("/", (req, res) => {
    const { eventTypeId, startAt, guestName, guestEmail } = req.body;
    if (!eventTypeId || !startAt || !guestName || !guestEmail) {
        return res
            .status(400)
            .json({ code: "validation_error", message: "Missing required fields" });
    }
    const eventType = (0, store_1.findEventType)(eventTypeId);
    if (!eventType) {
        return res
            .status(404)
            .json({ code: "not_found", message: "Event type not found" });
    }
    const now = new Date();
    const windowStart = (0, date_fns_1.startOfDay)(now);
    const windowEnd = (0, date_fns_1.addDays)(windowStart, 14);
    const bookingDate = (0, date_fns_1.parseISO)(startAt);
    if (!(0, date_fns_1.isWithinInterval)(bookingDate, { start: windowStart, end: windowEnd })) {
        return res.status(400).json({
            code: "booking_window_exceeded",
            message: "Booking date is outside the allowed window",
        });
    }
    const endAt = new Date((0, date_fns_1.parseISO)(startAt));
    endAt.setMinutes(endAt.getMinutes() + eventType.durationMinutes);
    if ((0, store_1.isSlotTaken)(startAt, endAt.toISOString())) {
        return res.status(409).json({
            code: "slot_unavailable",
            message: "Slot already booked",
        });
    }
    const newBooking = {
        id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
        eventTypeId,
        startAt,
        endAt: endAt.toISOString(),
        guestName,
        guestEmail,
    };
    (0, store_1.addBooking)(newBooking);
    res.status(200).json(newBooking);
});
router.get("/", (req, res) => {
    const from = req.query.from;
    const list = (0, store_1.getBookings)(from);
    list.sort((a, b) => a.startAt.localeCompare(b.startAt));
    const enriched = list.map((b) => {
        const et = (0, store_1.findEventType)(b.eventTypeId);
        return { ...b, eventType: et };
    });
    res.json(enriched);
});
exports.default = router;
