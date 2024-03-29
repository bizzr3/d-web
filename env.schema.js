module.exports = {
    cookie: {
        key: 'dskey',
        secret: 'redis-secret'
    },
    app: {
        expressPort: 7000,
        expressEnv: 'dev',
        socketPath: 'ws://deeployer.dev.com',
        request: {
            protocol: 'http://',
            domains: {
                main: 'deeployer.dev.com'
            }
        }
    },
    redis: {
        host: '127.0.0.1',
        port: 6379,
        ttl: 2600000
    },
    mongoDb: {
        dbName: 'db_dev',
        host: '127.0.0.1'
    },
    tokens: {
        google: {
            oauth: {
                clientId: 'ask manager for token code',
                clientSecret: 'ask manager for token code'
            }
        },
        aws: {
            s3: {
                accessKeyId: 'ask manager for token code',
                secretAccessKey: 'ask manager for token code',
                regin: 'us-west-2',
                bucket: 'deeployerdev'
            }
        }
    }
};
