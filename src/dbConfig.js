const sql = require('mssql');

const dbConfig = {
    user: 'MSc_IoT_admin', // better stored in an app setting such as process.env.DB_USER
    password: 'Do-not-use-this-password1!', // better stored in an app setting such as process.env.DB_PASSWORD
    server: 'medisync.database.windows.net', // better stored in an app setting such as process.env.DB_SERVER
    port: 1433, // optional, defaults to 1433, better stored in an app setting such as process.env.DB_PORT
    database: 'exampleDatabase', // better stored in an app setting such as process.env.DB_NAME
    authentication: {
        type: 'default'
    },
    options: {
        encrypt: true
    }
}

module.exports = dbConfig;
