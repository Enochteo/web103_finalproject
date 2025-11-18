import express from "express";
import router from "./routes/services.js";
import dotenv from "dotenv";
import cors from "cors";
import session from "express-session";
import passport from "./config/passport.js";

dotenv.config();
const app = express();
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: {
      // for local development over HTTP set `secure: false`
      secure: false,
      // allow cross-site requests from the dev client when using credentials
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use("/api", router);

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`server listening on http://localhost:${PORT}`);
});
