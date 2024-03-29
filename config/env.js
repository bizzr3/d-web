module.exports = function (app, express, io) {
    'use strict';

    var path         = require('path');
    var favicon      = require('serve-favicon');
    var cookieParser = require('cookie-parser');
    var bodyParser   = require('body-parser');
    var util         = require('util');

    // session on redis
    var redis      = require("redis");
    var session    = require('express-session');
    var redisStore = require('connect-redis')(session);
    var client     = redis.createClient();
    var logger     = require('morgan');
    var fs         = require('fs');

    logger.token('pid', function getPid (req) {
        return process.pid;
    });
    var fileStreamRotator = require('file-stream-rotator');
    var logDirectory      = __dirname + '/../logs';

    if (!fs.existsSync(logDirectory)) {
        fs.mkdirSync(logDirectory);
    }

    var accessLogStream = fileStreamRotator.getStream({
        date_format: 'YYYY-MM-DD',
        filename   : logDirectory + '/access-%DATE%.log',
        frequency  : 'daily',
        verbose    : false
    });

    app.use(logger(
        '[:pid] [:date[clf]] :method :url :status (:response-time ms)  ":referrer" ":user-agent"', {
            stream: accessLogStream,
            skip  : function (req, res) {
                return res.statusCode <= 400;
            }
        }));

    var sessionStore = new redisStore({
        host  : getEnvConfig('redis').host,
        port  : getEnvConfig('redis').port,
        client: client,
        ttl   : getEnvConfig('redis').ttl
    });

    app.use(session({
        cookie           : {
            path    : '/',
            httpOnly: true,
            maxAge  : getEnvConfig('redis').ttl
        },
        key              : getEnvConfig('cookie').key,
        secret           : getEnvConfig('cookie').secret,
        // create new redis store.
        store            : sessionStore,
        proxy            : true,
        resave           : true,
        saveUninitialized: true
    }));

    var swig = require('swig');
    swig.setDefaults({
        varControls: ['[[', ']]'],
        cache      : false
    });
    app.engine('html', swig.renderFile);
    // view engine setup
    app.set('view engine', 'html');
    app.set('views', path.join(__dirname, '../views'));
    app.set('view cache', false);

    app.use(favicon(path.join(__dirname, '../public/assets/images/favicon.ico')));
    app.use(bodyParser.json());

    app.use(bodyParser.urlencoded({
        extended: false,
        limit   : '50mb'
    }));

    app.use(cookieParser());
    app.use(express.static(path.join(__dirname, '../public')));

    require('./auth/google.js')();

    app.use(passport.initialize());
    app.use(passport.session());

    var cookie = require('express/node_modules/cookie');

    io.use(function (socket, next) {
        var reqCookie = socket.request.headers.cookie;
        if (reqCookie) {
            socket.cookie    = cookie.parse(reqCookie);
            socket.sessionId = cookieParser.signedCookie(socket.cookie[getEnvConfig('cookie').key], getEnvConfig('cookie').secret);
            sessionStore.get(socket.sessionId, function (err, sessionData) {
                if (!err) {
                    if (sessionData.passport.user) {
                        socket.session = sessionData.passport;
                        next(null, socket);
                        
                        return;
                    }
                }

                next(new Error('Authentication error'), false);
            });
        } else {
            next(new Error('Authentication error'), false);
        }
    });

    require('../sockets')(io).drive();
};
