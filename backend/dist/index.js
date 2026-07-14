"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const eventTypes_1 = __importDefault(require("./routes/eventTypes"));
const bookings_1 = __importDefault(require("./routes/bookings"));
const availability_1 = __importDefault(require("./routes/availability"));
const publicEventTypes_1 = __importDefault(require("./routes/publicEventTypes"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use("/event-types", publicEventTypes_1.default);
app.use("/availability", availability_1.default);
app.use("/bookings", bookings_1.default);
// Admin routes
app.use("/admin/event-types", eventTypes_1.default);
app.use("/admin/bookings", bookings_1.default); // тот же роутер для GET /admin/bookings
if (process.env.NODE_ENV === "production") {
    const staticPath = path_1.default.resolve(__dirname, "../../public");
    app.use(express_1.default.static(staticPath));
    app.get("/{*splat}", (req, res) => {
        res.sendFile(path_1.default.join(staticPath, "index.html"));
    });
}
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
});
