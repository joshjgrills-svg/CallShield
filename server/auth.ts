import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import type { Express } from 'express';
import session from 'express-session';
import createMemoryStore from 'memorystore';
import { supabase } from './db';

const MemoryStore = createMemoryStore(session);

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || 'callshield-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 86400000,
    },
    store: new MemoryStore({
      checkPeriod: 86400000,
    }),
  };

  if (app.get('env') === 'production') {
    app.set('trust proxy', 1);
    sessionSettings.cookie!.secure = true;
  }

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      done(null, data);
    } catch (error) {
      done(error);
    }
  });

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        let { data: user, error } = await supabase
          .from('users')
          .select('*')
          .eq('username', username)
          .maybeSingle();

        if (error) throw error;

        if (!user) {
          const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert([{ username, display_name: username }])
            .select()
            .single();

          if (insertError) throw insertError;

          const { error: settingsError } = await supabase
            .from('user_settings')
            .insert([{ user_id: newUser.id }]);

          if (settingsError) throw settingsError;

          user = newUser;
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );

  app.post('/api/auth/login', passport.authenticate('local'), (req, res) => {
    res.json({ success: true, user: req.user });
  });

  app.post('/api/auth/logout', (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.json({ success: true });
    });
  });
}

export function requireAuth(req: Express.Request, res: Express.Response, next: Express.NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Authentication required' });
}
