const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    passwordHash: {
        type: DataTypes.STRING,
        allowNull: false,
    },
});

const Playlist = sequelize.define('Playlist', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    ownerEmail: {
        type: DataTypes.STRING,
        allowNull: false,
    },
});

const Song = sequelize.define('Song', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    artist: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    year: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    youTubeId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    order: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
});

User.hasMany(Playlist, { foreignKey: 'ownerId', onDelete: 'CASCADE' });
Playlist.belongsTo(User, { foreignKey: 'ownerId' });

Playlist.hasMany(Song, { foreignKey: 'playlistId', onDelete: 'CASCADE' });
Song.belongsTo(Playlist, { foreignKey: 'playlistId' });

module.exports = {
    sequelize,
    User,
    Playlist,
    Song,
};
