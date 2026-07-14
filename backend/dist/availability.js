"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAvailableSlots = generateAvailableSlots;
const store_1 = require("./store");
const date_fns_1 = require("date-fns");
const BOOKING_WINDOW_DAYS = 14;
const SLOT_STEP_MINUTES = 30;
const WORK_START_HOUR = 9;
const WORK_END_HOUR = 18;
function generateAvailableSlots(eventTypeId, from, to) {
    const eventType = store_1.eventTypes.find(et => et.id === eventTypeId);
    if (!eventType)
        return [];
    const now = new Date();
    const windowStart = from ? (0, date_fns_1.parseISO)(from) : (0, date_fns_1.startOfDay)(now);
    const windowEnd = to ? (0, date_fns_1.parseISO)(to) : (0, date_fns_1.startOfDay)((0, date_fns_1.addDays)(now, BOOKING_WINDOW_DAYS));
    const slots = [];
    let currentDay = (0, date_fns_1.startOfDay)(windowStart);
    while (currentDay <= windowEnd) {
        let hour = WORK_START_HOUR;
        while (hour < WORK_END_HOUR) {
            let minute = 0;
            while (minute < 60) {
                const slotStart = new Date(currentDay);
                slotStart.setHours(hour, minute, 0, 0);
                if (slotStart < windowStart) {
                    minute += SLOT_STEP_MINUTES;
                    continue;
                }
                const slotEnd = (0, date_fns_1.addMinutes)(slotStart, eventType.durationMinutes);
                if (slotEnd > windowEnd || slotEnd.getHours() > WORK_END_HOUR || (slotEnd.getHours() === WORK_END_HOUR && slotEnd.getMinutes() > 0)) {
                    break;
                }
                const startISO = (0, date_fns_1.formatISO)(slotStart);
                if (!(0, store_1.isSlotTaken)(startISO, (0, date_fns_1.formatISO)(slotEnd))) {
                    slots.push({
                        startAt: startISO,
                        endAt: (0, date_fns_1.formatISO)(slotEnd)
                    });
                }
                minute += SLOT_STEP_MINUTES;
            }
            hour++;
        }
        currentDay = (0, date_fns_1.addDays)(currentDay, 1);
    }
    return slots;
}
