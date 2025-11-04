const mongoose = require('mongoose');
const DatabaseManager = require('../DatabaseManager');

const { Schema } = mongoose;

const SongSchema = new Schema(
    {
        title: String,
        artist: String,
        year: Number,
        youTubeId: String,
    },
    { _id: false },
);

const PlaylistSchema = new Schema(
    {
        name: { type: String, required: true },
        ownerEmail: { type: String, required: true },
        songs: { type: [SongSchema], required: true },
    },
    { timestamps: true },
);

const UserSchema = new Schema(
    {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        email: { type: String, required: true },
        passwordHash: { type: String, required: true },
        playlists: [{ type: Schema.Types.ObjectId, ref: 'Playlist' }],
    },
    { timestamps: true },
);

const PlaylistModel = mongoose.model('Playlist', PlaylistSchema);
const UserModel = mongoose.model('User', UserSchema);

class MongoDatabaseManager extends DatabaseManager {
    constructor() {
        super();
        this.connection = null;
    }

    async initialize() {
        if (this.connection) {
            return this.connection;
        }

        this.connection = await mongoose.connect(process.env.DB_CONNECT, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        return this.connection;
    }

    async close() {
        if (this.connection) {
            await mongoose.connection.close();
            this.connection = null;
        }
    }

    async getUserById(id) {
        const user = await UserModel.findById(id);
        return this.#toPlain(user);
    }

    async getUserByEmail(email) {
        const user = await UserModel.findOne({ email });
        return this.#toPlain(user);
    }

    async createUser(userData) {
        const user = new UserModel(userData);
        await user.save();
        return this.#toPlain(user);
    }

    async createPlaylistForUser(userId, playlistData) {
        const user = await UserModel.findById(userId);
        if (!user) {
            return null;
        }

        const playlist = new PlaylistModel({
            name: playlistData.name,
            songs: playlistData.songs || [],
            ownerEmail: user.email,
        });

        await playlist.save();

        user.playlists.push(playlist._id);
        await user.save();

        return this.#toPlain(playlist);
    }

    async getPlaylistById(id) {
        const playlist = await PlaylistModel.findById(id);
        return this.#toPlain(playlist);
    }

    async getPlaylistsByOwnerEmail(ownerEmail) {
        const playlists = await PlaylistModel.find({ ownerEmail });
        return playlists.map((playlist) => this.#toPlain(playlist));
    }

    async getAllPlaylists() {
        const playlists = await PlaylistModel.find({});
        return playlists.map((playlist) => this.#toPlain(playlist));
    }

    async updatePlaylistById(id, playlistData) {
        const playlist = await PlaylistModel.findById(id);
        if (!playlist) {
            return null;
        }

        playlist.name = playlistData.name;
        playlist.songs = playlistData.songs || [];
        await playlist.save();

        return this.#toPlain(playlist);
    }

    async deletePlaylistById(id) {
        const playlist = await PlaylistModel.findById(id);
        if (!playlist) {
            return null;
        }

        await UserModel.updateOne(
            { email: playlist.ownerEmail },
            { $pull: { playlists: playlist._id } },
        );

        await PlaylistModel.deleteOne({ _id: id });

        return this.#toPlain(playlist);
    }

    #toPlain(document) {
        if (!document) {
            return null;
        }
        const plain = document.toObject({ versionKey: false });
        if (plain._id) {
            const objectIdString = plain._id.toString();
            plain._id = objectIdString;
            if (!plain.id) {
                plain.id = objectIdString;
            }
        }
        return plain;
    }
}

module.exports = MongoDatabaseManager;
