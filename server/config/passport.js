import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import { pool } from "./database.js";

passport.use(
  new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
      try {
        const result = await pool.query(
          "SELECT * FROM Users WHERE email = $1",
          [email]
        );

        if (result.rows.length === 0) {
          return done(null, false, { message: "No user found" });
        }

        const user = result.rows[0];

        const match = await bcrypt.compare(password, user.hashed_password);
        if (!match) {
          return done(null, false, { message: "Wrong password" });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// user in session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// retrieve user from session
passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query("SELECT * FROM Users WHERE id = $1", [id]);
    done(null, result.rows[0]);
  } catch (error) {
    done(error);
  }
});

export default passport;
