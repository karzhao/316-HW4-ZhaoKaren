const DatabaseManager = require('../DatabaseManager');
const { sequelize, User, Playlist, Song } = require('./models');

class PostgreDatabaseManager extends DatabaseManager {
    async initialize() {
        await sequelize.authenticate();
        await sequelize.sync();
        return sequelize;
    }

    async close() {
        await sequelize.close();
    }

    async getUserById(id) {
        const user = await User.findByPk(id);
        return this.#toPlain(user);
    }

    async getUserByEmail(email) {
        const user = await User.findOne({ where: { email } });
        return this.#toPlain(user);
    }

    async createUser(userData) {
        const user = await User.create(userData);
        return this.#toPlain(user);
    }

    async createPlaylistForUser(userId, playlistData) {
        return sequelize.transaction(async (transaction) => {
            const user = await User.findByPk(userId, { transaction });
            if (!user) {
                return null;
            }

            const playlist = await Playlist.create(
                {
                    name: playlistData.name,
                    ownerEmail: user.email,
                    ownerId: user.id,
                },
                { transaction },
            );

            const songs = (playlistData.songs || []).map((song, index) => ({
                title: song.title,
                artist: song.artist,
                year: song.year,
                youTubeId: song.youTubeId,
                order: index,
                playlistId: playlist.id,
            }));

            if (songs.length > 0) {
                await Song.bulkCreate(songs, { transaction });
            }

            return this.#toPlain(
                await Playlist.findByPk(playlist.id, {
                    include: [{ model: Song }],
                    transaction,
                }),
            );
        });
    }

    async getPlaylistById(id) {
        const playlist = await Playlist.findByPk(id, {
            include: [{ model: Song }],
        });
        return this.#toPlain(playlist);
    }

    async getPlaylistsByOwnerEmail(ownerEmail) {
        const playlists = await Playlist.findAll({ where: { ownerEmail } });
        return playlists.map((playlist) => this.#toPlain(playlist));
    }

    async getAllPlaylists() {
        const playlists = await Playlist.findAll();
        return playlists.map((playlist) => this.#toPlain(playlist));
    }

    async updatePlaylistById(id, playlistData) {
        return sequelize.transaction(async (transaction) => {
            const playlist = await Playlist.findByPk(id, { transaction });
            if (!playlist) {
                return null;
            }

            playlist.name = playlistData.name;
            await playlist.save({ transaction });

            await Song.destroy({ where: { playlistId: playlist.id }, transaction });

            const songs = (playlistData.songs || []).map((song, index) => ({
                title: song.title,
                artist: song.artist,
                year: song.year,
                youTubeId: song.youTubeId,
                order: index,
                playlistId: playlist.id,
            }));

            if (songs.length > 0) {
                await Song.bulkCreate(songs, { transaction });
            }

            return this.#toPlain(
                await Playlist.findByPk(playlist.id, {
                    include: [{ model: Song }],
                    transaction,
                }),
            );
        });
    }

    async deletePlaylistById(id) {
        return sequelize.transaction(async (transaction) => {
            const playlist = await Playlist.findByPk(id, {
                include: [{ model: Song }],
                transaction,
            });
            if (!playlist) {
                return null;
            }

            await Song.destroy({ where: { playlistId: playlist.id }, transaction });
            await Playlist.destroy({ where: { id: playlist.id }, transaction });

            return this.#toPlain(playlist);
        });
    }

    #toPlain(instance) {
        if (!instance) {
            return null;
        }
        const plain = instance.toJSON();
        if (plain.id) {
            plain.id = plain.id.toString();
        }
        if (plain.Songs) {
            plain.songs = plain.Songs
                .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                .map(({ title, artist, year, youTubeId }) => ({
                    title,
                    artist,
                    year,
                    youTubeId,
                }));
            delete plain.Songs;
        } else if (!plain.songs) {
            plain.songs = [];
        }
        return plain;
    }
}

module.exports = PostgreDatabaseManager;
