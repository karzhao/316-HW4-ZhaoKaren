class DatabaseManager {
    async initialize() {
        throw new Error('initialize() must be implemented by subclasses.');
    }

    async close() {
        throw new Error('close() must be implemented by subclasses.');
    }

    async getUserById(id) {
        throw new Error('getUserById() must be implemented by subclasses.');
    }

    async getUserByEmail(email) {
        throw new Error('getUserByEmail() must be implemented by subclasses.');
    }

    async createUser(userData) {
        throw new Error('createUser() must be implemented by subclasses.');
    }

    async createPlaylistForUser(userId, playlistData) {
        throw new Error('createPlaylistForUser() must be implemented by subclasses.');
    }

    async getPlaylistById(id) {
        throw new Error('getPlaylistById() must be implemented by subclasses.');
    }

    async getPlaylistsByOwnerEmail(ownerEmail) {
        throw new Error('getPlaylistsByOwnerEmail() must be implemented by subclasses.');
    }

    async getAllPlaylists() {
        throw new Error('getAllPlaylists() must be implemented by subclasses.');
    }

    async updatePlaylistById(id, playlistData) {
        throw new Error('updatePlaylistById() must be implemented by subclasses.');
    }

    async deletePlaylistById(id) {
        throw new Error('deletePlaylistById() must be implemented by subclasses.');
    }
}

module.exports = DatabaseManager;
