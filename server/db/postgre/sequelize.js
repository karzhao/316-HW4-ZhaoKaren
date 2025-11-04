const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    process.env.POSTGRE_DB,
    process.env.POSTGRE_USER,
    process.env.POSTGRE_PASSWORD,
    {
        host: process.env.POSTGRE_HOST,
        port: process.env.POSTGRE_PORT,
        dialect: 'postgres',
        logging: false,
    },
);

module.exports = sequelize;
