"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookings = exports.eventTypes = void 0;
exports.findEventType = findEventType;
exports.addEventType = addEventType;
exports.updateEventType = updateEventType;
exports.deleteEventType = deleteEventType;
exports.addBooking = addBooking;
exports.isSlotTaken = isSlotTaken;
exports.getBookings = getBookings;
exports.eventTypes = [];
exports.bookings = [];
function findEventType(id) {
    return exports.eventTypes.find((et) => et.id === id);
}
function addEventType(eventType) {
    exports.eventTypes.push(eventType);
}
function updateEventType(id, data) {
    const index = exports.eventTypes.findIndex((et) => et.id === id);
    if (index === -1)
        return undefined;
    const updated = { ...exports.eventTypes[index], ...data };
    exports.eventTypes[index] = updated;
    return updated;
}
function deleteEventType(id) {
    const index = exports.eventTypes.findIndex((et) => et.id === id);
    if (index === -1)
        return false;
    exports.eventTypes.splice(index, 1);
    return true;
}
function addBooking(booking) {
    exports.bookings.push(booking);
}
function isSlotTaken(startAt, endAt) {
    return exports.bookings.some((b) => startAt < b.endAt && endAt > b.startAt);
}
function getBookings(from) {
    if (!from)
        return exports.bookings;
    return exports.bookings.filter((b) => b.startAt >= from);
}
