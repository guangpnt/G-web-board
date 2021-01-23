const GoogleStrategy = require('passport-google-oauth20').Strategy
const mongoose = require('mongoose')
const GUser = require('../models/GUser')

module.exports = function(passport) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/google/callback'
    },
    async (accessToken, refreshToken, profile, done) => {   
        const newGUser = {
            googleID: profile.id,
            displayName: profile.displayName,
            email: profile._json.email
        }

        try {
            let user = await GUser.findOne({ googleID: profile.id })

            if(user) {
                done(null, user)
            } else {
                user = await GUser.create(newGUser)
                done(null, user)
            }
        } catch (err) {
            console.error(err)
        }
    }))
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });
      
    passport.deserializeUser((id, done) => {
        GUser.findById(id, (err, user) => {
          done(err, user);
        });
    });
}