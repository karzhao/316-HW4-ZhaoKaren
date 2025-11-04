import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { describe, beforeAll, afterAll, test, expect } from 'vitest';
import dbManager from '../db/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

describe.sequential('DatabaseManager contract', () => {
    const uniqueSuffix = Date.now().toString(36);
    const userPayload = {
        firstName: 'Test',
        lastName: 'User',
        email: `vitest-${uniqueSuffix}@example.com`,
        passwordHash: 'test-hash',
    };

    const initialSongs = [
        { title: 'Song A', artist: 'Artist 1', year: 2001, youTubeId: 'AAAAAAA1111' },
        { title: 'Song B', artist: 'Artist 2', year: 2002, youTubeId: 'BBBBBBB2222' },
    ];

    const updatedSongs = [
        { title: 'Song C', artist: 'Artist 3', year: 2003, youTubeId: 'CCCCCCC3333' },
    ];

    let connectionHandle = null;
    let createdUser = null;
    let createdPlaylist = null;
    let createdPlaylistId = null;
    let connectionClosedInTest = false;

    beforeAll(async () => {
        connectionHandle = await dbManager.initialize();
    });

    afterAll(async () => {
        if (!connectionClosedInTest) {
            await dbManager.close();
        }
    });

    test('initialize establishes a connection', () => {
        expect(connectionHandle).toBeTruthy();
    });

    test('createUser stores a new user', async () => {
        createdUser = await dbManager.createUser(userPayload);
        expect(createdUser).toBeTruthy();
        expect(createdUser.email).toBe(userPayload.email);
    });

    test('getUserById retrieves the stored user', async () => {
        const fetched = await dbManager.getUserById(createdUser.id || createdUser._id);
        expect(fetched).toBeTruthy();
        expect(fetched.email).toBe(userPayload.email);
    });

    test('getUserByEmail retrieves the stored user', async () => {
        const fetched = await dbManager.getUserByEmail(userPayload.email);
        expect(fetched).toBeTruthy();
        expect(fetched.firstName).toBe(userPayload.firstName);
    });

    test('createPlaylistForUser stores playlist with songs', async () => {
        createdPlaylist = await dbManager.createPlaylistForUser(
            createdUser.id || createdUser._id,
            {
                name: 'Test Playlist',
                songs: initialSongs,
            },
        );
        expect(createdPlaylist).toBeTruthy();
        createdPlaylistId = createdPlaylist._id || createdPlaylist.id;
        expect(createdPlaylistId).toBeTruthy();
        expect(createdPlaylist.songs.length).toBe(initialSongs.length);
    });

    test('getPlaylistById retrieves stored playlist', async () => {
        const fetched = await dbManager.getPlaylistById(createdPlaylistId);
        expect(fetched).toBeTruthy();
        expect(fetched.name).toBe('Test Playlist');
    });

    test('getPlaylistsByOwnerEmail lists playlists for owner', async () => {
        const playlists = await dbManager.getPlaylistsByOwnerEmail(userPayload.email);
        expect(Array.isArray(playlists)).toBe(true);
        const ids = playlists.map((pl) => pl._id || pl.id);
        expect(ids).toContain(createdPlaylistId);
    });

    test('getAllPlaylists returns an array with the created playlist', async () => {
        const playlists = await dbManager.getAllPlaylists();
        expect(Array.isArray(playlists)).toBe(true);
        expect(playlists.length).toBeGreaterThan(0);
        const ids = playlists.map((pl) => pl._id || pl.id);
        expect(ids).toContain(createdPlaylistId);
    });

    test('updatePlaylistById updates playlist fields', async () => {
        const updatedName = 'Updated Playlist';
        const updated = await dbManager.updatePlaylistById(createdPlaylistId, {
            name: updatedName,
            songs: updatedSongs,
        });
        expect(updated).toBeTruthy();
        expect(updated.name).toBe(updatedName);
        expect(updated.songs.length).toBe(updatedSongs.length);
    });

    test('deletePlaylistById removes playlist', async () => {
        const deleted = await dbManager.deletePlaylistById(createdPlaylistId);
        expect(deleted).toBeTruthy();

        const lookup = await dbManager.getPlaylistById(createdPlaylistId);
        expect(lookup).toBeNull();
    });

    test('close terminates the database connection', async () => {
        await expect(dbManager.close()).resolves.toBeUndefined();
        connectionClosedInTest = true;
    });
});
