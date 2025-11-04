/*
    This is our http api, which we use to send requests to
    our back-end API. Note we`re using the Axios library
    for doing this, which is an easy to use AJAX-based
    library. We could (and maybe should) use Fetch, which
    is a native (to browsers) standard, but Axios is easier
    to use when sending JSON back and forth and it`s a Promise-
    based API which helps a lot with asynchronous communication.
    
    @author McKilla Gorilla
*/

// THESE ARE ALL THE REQUESTS WE`LL BE MAKING, ALL REQUESTS HAVE A
// REQUEST METHOD (like get) AND PATH (like /top5list). SOME ALSO
// REQUIRE AN id SO THAT THE SERVER KNOWS ON WHICH LIST TO DO ITS
// WORK, AND SOME REQUIRE DATA, WHICH WE WE WILL FORMAT HERE, FOR WHEN
// WE NEED TO PUT THINGS INTO THE DATABASE OR IF WE HAVE SOME
// CUSTOM FILTERS FOR QUERIES
const BASE_URL = 'http://localhost:4000/store';

async function request(path, options = {}) {
    const { body, headers, ...rest } = options;
    const config = {
        method: 'GET',
        credentials: 'include',
        ...rest,
        headers: {
            Accept: 'application/json',
            ...(headers || {}),
        },
    };

    if (body !== undefined) {
        config.body = typeof body === 'string' ? body : JSON.stringify(body);
        if (!config.headers['Content-Type']) {
            config.headers['Content-Type'] = 'application/json';
        }
    }

    const response = await fetch(`${BASE_URL}${path}`, config);
    const contentType = response.headers.get('content-type') || '';
    let data = null;

    try {
        const rawBody = await response.text();
        if (rawBody) {
            if (contentType.includes('application/json')) {
                try {
                    data = JSON.parse(rawBody);
                } catch (parseError) {
                    data = rawBody;
                }
            } else {
                data = rawBody;
            }
        }
    } catch (readError) {
        data = null;
    }

    const normalized = {
        status: response.status,
        statusText: response.statusText,
        data,
    };

    if (!response.ok) {
        const error = new Error(`Request failed with status ${response.status}`);
        error.response = normalized;
        throw error;
    }

    return normalized;
}

export const createPlaylist = (newListName, newSongs, userEmail) => (
    request(`/playlist/`, {
        method: 'POST',
        body: {
            name: newListName,
            songs: newSongs,
            ownerEmail: userEmail,
        },
    })
);
export const deletePlaylistById = (id) => request(`/playlist/${id}`, { method: 'DELETE' });
export const getPlaylistById = (id) => request(`/playlist/${id}`);
export const getPlaylistPairs = () => request(`/playlistpairs/`);
export const updatePlaylistById = (id, playlist) => (
    request(`/playlist/${id}`, {
        method: 'PUT',
        body: {
            playlist,
        },
    })
);

const apis = {
    createPlaylist,
    deletePlaylistById,
    getPlaylistById,
    getPlaylistPairs,
    updatePlaylistById,
};

export default apis;
