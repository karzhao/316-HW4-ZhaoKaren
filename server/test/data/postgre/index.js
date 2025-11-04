const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

const { sequelize, User, Playlist, Song } = require('../../../db/postgre/models');
const testData = require('../example-db-data.json');

async function resetPostgre() {
    console.log('Resetting the PostgreSQL DB');

    try {
        await sequelize.authenticate();
        await sequelize.sync({ force: true });

        const usersByEmail = new Map();

        for (const user of testData.users) {
            const createdUser = await User.create({
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                passwordHash: user.passwordHash,
            });

            usersByEmail.set(user.email, createdUser);
        }

        for (const playlist of testData.playlists) {
            const owner = usersByEmail.get(playlist.ownerEmail);
            if (!owner) {
                continue;
            }

            const createdPlaylist = await Playlist.create({
                name: playlist.name,
                ownerEmail: playlist.ownerEmail,
                ownerId: owner.id,
            });

            if (!playlist.songs || playlist.songs.length === 0) {
                continue;
            }

            await Song.bulkCreate(
                playlist.songs.map((song, index) => ({
                    title: song.title,
                    artist: song.artist,
                    year: song.year,
                    youTubeId: song.youTubeId,
                    order: index,
                    playlistId: createdPlaylist.id,
                })),
            );
        }

        console.log('PostgreSQL reset complete');
    } catch (err) {
        console.error('PostgreSQL reset failed', err);
    } finally {
        await sequelize.close();
    }
}

resetPostgre();
