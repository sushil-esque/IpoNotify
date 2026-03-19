"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const ipos_1 = __importDefault(require("./routes/ipos"));
const auth_1 = __importDefault(require("./routes/auth"));
const scrapeIpos_1 = __importDefault(require("./routes/scrapeIpos"));
const express_session_1 = __importDefault(require("express-session"));
const mongoose_1 = __importDefault(require("mongoose"));
const connect_mongo_1 = __importDefault(require("connect-mongo"));
const passport_1 = __importDefault(require("passport"));
require("./strategies/googleStrategy");
const errorHandler_1 = require("./middlewares/errorHandler");
const app = (0, express_1.default)();
const DB_URL = process.env.MONGO_URL;
mongoose_1.default.connect(DB_URL)
    .then(() => console.log("connected to database"))
    .catch((err) => {
    console.log(err);
});
app.use(express_1.default.json());
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
    cookie: {
        maxAge: 60000 * 60 * 24, // 1 day
        // Only send cookie over HTTPS in production.
        // Must be true when using sameSite: "none"
        secure: process.env.NODE_ENV === "production",
        // Allow cookie to be sent from backend (Render)
        // to frontend on a different domain (Vercel).
        // Chrome requires "none" and secure: true for this.
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        // Prevent javascript from accessing the cookie (extra security)
        httpOnly: true,
    },
    store: connect_mongo_1.default.create({
        client: mongoose_1.default.connection.getClient(),
    }),
}));
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
const PORT = 3000;
app.use(auth_1.default);
app.use(ipos_1.default);
app.use(scrapeIpos_1.default);
app.use(errorHandler_1.errorHandler);
app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
});
//# sourceMappingURL=index.js.map