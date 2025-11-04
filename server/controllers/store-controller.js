const auth = require('../auth')
const dbManager = require('../db')
/*
    This is our back-end API. It provides all the data services
    our database needs. Note that this file contains the controller
    functions for each endpoint.
    
    @author McKilla Gorilla
*/
createPlaylist = async (req, res) => {
    if(auth.verifyUser(req) === null){
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }
    const body = req.body;
    console.log("createPlaylist body: " + JSON.stringify(body));
    if (!body) {
        return res.status(400).json({
            success: false,
            error: 'You must provide a Playlist',
        })
    }
    
    try {
        const playlist = await dbManager.createPlaylistForUser(req.userId, body);
        if (!playlist) {
            return res.status(400).json({
                errorMessage: 'Playlist Not Created!'
            })
        }

        return res.status(201).json({
            playlist: playlist
        })
    } catch (err) {
        console.error(err);
        return res.status(400).json({
            errorMessage: 'Playlist Not Created!'
        })
    }
}
deletePlaylist = async (req, res) => {
    if(auth.verifyUser(req) === null){
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }
    console.log("delete Playlist with id: " + JSON.stringify(req.params.id));
    console.log("delete " + req.params.id);
    try {
        const playlist = await dbManager.getPlaylistById(req.params.id);
        console.log("playlist found: " + JSON.stringify(playlist));
        if (!playlist) {
            return res.status(404).json({
                errorMessage: 'Playlist not found!',
            })
        }

        const owner = await dbManager.getUserByEmail(playlist.ownerEmail);
        if (!owner || (owner.id || owner._id) != req.userId) {
            console.log("incorrect user!");
            return res.status(400).json({ 
                errorMessage: "authentication error" 
            });
        }

        await dbManager.deletePlaylistById(req.params.id);
        return res.status(200).json({});
    } catch (err) {
        console.error(err);
        return res.status(400).json({
            errorMessage: 'Playlist not deleted!'
        })
    }
}
getPlaylistById = async (req, res) => {
    if(auth.verifyUser(req) === null){
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }
    console.log("Find Playlist with id: " + JSON.stringify(req.params.id));

    try {
        const list = await dbManager.getPlaylistById(req.params.id);
        if (!list) {
            return res.status(400).json({ success: false, error: 'Playlist not found!' });
        }
        console.log("Found list: " + JSON.stringify(list));

        const user = await dbManager.getUserByEmail(list.ownerEmail);
        console.log("user: " + JSON.stringify(user));
        if (user && (user.id || user._id) == req.userId) {
            console.log("correct user!");
            return res.status(200).json({ success: true, playlist: list })
        }

        console.log("incorrect user!");
        return res.status(400).json({ success: false, description: "authentication error" });
    } catch (err) {
        console.error(err);
        return res.status(400).json({ success: false, error: err });
    }
}
getPlaylistPairs = async (req, res) => {
    if(auth.verifyUser(req) === null){
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }
    console.log("getPlaylistPairs");
    try {
        const user = await dbManager.getUserById(req.userId);
        console.log("find user with id " + req.userId + ": " + JSON.stringify(user));
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        const playlists = await dbManager.getPlaylistsByOwnerEmail(user.email);
        console.log("found Playlists: " + JSON.stringify(playlists));
        if (!playlists || playlists.length === 0) {
            return res
                .status(404)
                .json({ success: false, error: 'Playlists not found' })
        }

        const pairs = playlists.map((list) => ({
            _id: list._id || list.id,
            name: list.name,
        }));

        return res.status(200).json({ success: true, idNamePairs: pairs })
    } catch (err) {
        console.error(err);
        return res.status(400).json({ success: false, error: err });
    }
}
getPlaylists = async (req, res) => {
    if(auth.verifyUser(req) === null){
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }
    try {
        const playlists = await dbManager.getAllPlaylists();
        if (!playlists || playlists.length === 0) {
            return res
                .status(404)
                .json({ success: false, error: `Playlists not found` })
        }
        return res.status(200).json({ success: true, data: playlists })
    } catch (err) {
        console.error(err);
        return res.status(400).json({ success: false, error: err })
    }
}
updatePlaylist = async (req, res) => {
    if(auth.verifyUser(req) === null){
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }
    const body = req.body
    console.log("updatePlaylist: " + JSON.stringify(body));
    console.log("req.body.name: " + req.body.name);

    if (!body) {
        return res.status(400).json({
            success: false,
            error: 'You must provide a body to update',
        })
    }
    if (!body.playlist) {
        return res.status(400).json({
            success: false,
            error: 'You must provide playlist data to update',
        })
    }

    try {
        const playlist = await dbManager.getPlaylistById(req.params.id);
        console.log("playlist found: " + JSON.stringify(playlist));
        if (!playlist) {
            return res.status(404).json({
                message: 'Playlist not found!',
            })
        }

        const owner = await dbManager.getUserByEmail(playlist.ownerEmail);
        console.log("owner: " + JSON.stringify(owner));
        if (!owner || (owner.id || owner._id) != req.userId) {
            console.log("incorrect user!");
            return res.status(400).json({ success: false, description: "authentication error" });
        }

        const updated = await dbManager.updatePlaylistById(req.params.id, body.playlist);
        if (!updated) {
            return res.status(404).json({
                message: 'Playlist not updated!',
            })
        }

        console.log("SUCCESS!!!");
        return res.status(200).json({
            success: true,
            id: updated._id || updated.id,
            message: 'Playlist updated!',
        })
    } catch (error) {
        console.log("FAILURE: " + JSON.stringify(error));
        return res.status(404).json({
            error,
            message: 'Playlist not updated!',
        })
    }
}
module.exports = {
    createPlaylist,
    deletePlaylist,
    getPlaylistById,
    getPlaylistPairs,
    getPlaylists,
    updatePlaylist
}
