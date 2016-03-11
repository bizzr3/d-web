module.exports = function (passport) {
    'use strict';

    var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

    passport.serializeUser(function (user, done) {
        done(null, user);
    });

    passport.deserializeUser(function (sessionUser, done) {
        done(null, sessionUser);
    });

    // make sure google+ api is activated in case you have auth problem
    passport.use(new GoogleStrategy({
            clientID: getEnvConfig('tokens').google.oauth.clientId,
            clientSecret: getEnvConfig('tokens').google.oauth.clientSecret,
            callbackURL: getDomain() + '/account/sign-in/google/callback',
            passReqToCallback: true
        },
        function (accessToken, refreshToken, arg1, profile, done) {
            var userRepos = getRepos('users');

            userRepos.isUserRegistered(profile, profile.emails[0].value, function (res) {
                done(null, res);
            });
        })
    );
};
