import { storableError } from '../../util/errors';
import { addMarketplaceEntities } from '../../ducks/marketplaceData.duck';
import { fetchCurrentUser } from '../../ducks/user.duck';

// ================ Action types ================ //

export const FETCH_FEATURED_REQUEST = 'app/FeaturedPage/FETCH_FEATURED_REQUEST';
export const FETCH_FEATURED_SUCCESS = 'app/FeaturedPage/FETCH_FEATURED_SUCCESS';
export const FETCH_FEATURED_ERROR = 'app/FeaturedPage/FETCH_FEATURED_ERROR';

export const TOGGLE_FAVORITE_REQUEST = 'app/FeaturedPage/TOGGLE_FAVORITE_REQUEST';
export const TOGGLE_FAVORITE_SUCCESS = 'app/FeaturedPage/TOGGLE_FAVORITE_SUCCESS';
export const TOGGLE_FAVORITE_ERROR = 'app/FeaturedPage/TOGGLE_FAVORITE_ERROR';

// ================ Reducer ================ //

const initialState = {
    fetchInProgress: false,
    fetchError: null,
    featuredIds: [],
    toggleFavInProgress: false,
    toggleFavError: null,
};

const resultIds = data => {
    const listings = data.data;
    return listings
        .filter(l => !l.attributes.deleted && l.attributes.state === 'published')
        .map(l => l.id);
};

const featuredPageReducer = (state = initialState, action = {}) => {
    const { type, payload } = action;
    switch (type) {
        case FETCH_FEATURED_REQUEST:
            return { ...state, fetchInProgress: true, fetchError: null };
        case FETCH_FEATURED_SUCCESS:
            return {
                ...state,
                featuredIds: resultIds(payload.data),
                fetchInProgress: false,
            };
        case FETCH_FEATURED_ERROR:
            return { ...state, fetchInProgress: false, fetchError: payload };

        case TOGGLE_FAVORITE_REQUEST:
            return { ...state, toggleFavInProgress: true, toggleFavError: null };
        case TOGGLE_FAVORITE_SUCCESS:
            return { ...state, toggleFavInProgress: false };
        case TOGGLE_FAVORITE_ERROR:
            return { ...state, toggleFavInProgress: false, toggleFavError: payload };

        default:
            return state;
    }
};

export default featuredPageReducer;

// ================ Action creators ================ //

export const fetchFeaturedRequest = () => ({ type: FETCH_FEATURED_REQUEST });
export const fetchFeaturedSuccess = response => ({
    type: FETCH_FEATURED_SUCCESS,
    payload: { data: response.data },
});
export const fetchFeaturedError = e => ({ type: FETCH_FEATURED_ERROR, error: true, payload: e });

export const toggleFavoriteRequest = () => ({ type: TOGGLE_FAVORITE_REQUEST });
export const toggleFavoriteSuccess = response => ({
    type: TOGGLE_FAVORITE_SUCCESS,
    payload: response,
});
export const toggleFavoriteError = e => ({ type: TOGGLE_FAVORITE_ERROR, error: true, payload: e });

// ================ Thunks ================ //

// 1. Fetch featured listings
export const fetchFeaturedListings = config => (dispatch, getState, sdk) => {
    dispatch(fetchFeaturedRequest());

    return sdk.listings
        .query({
            pub_isFeatured: true, // 👈 your flag in publicData
            perPage: 12,
            include: ['author', 'images'],
            'fields.listing': ['title', 'geolocation', 'price', 'publicData.isFeatured', 'publicData.isFav'],
            'fields.user': ['profile.displayName'],
            'fields.image': ['variants.scaled-small', 'variants.scaled-medium'],
            'limit.images': 1,
        })
        .then(response => {
            console.log('response', response)
            dispatch(addMarketplaceEntities(response));
            dispatch(fetchFeaturedSuccess(response));
            return response;
        })
        .catch(e => {
            dispatch(fetchFeaturedError(storableError(e)));
        });
};

// 2. Mark/unmark as favorite
export const toggleFavorite = (listingId, isFav) => (dispatch, getState, sdk) => {
    dispatch(toggleFavoriteRequest());

    const state = getState();
    const currentUser = state.user.currentUser;

    if (!currentUser) {
        const err = new Error('No current user available');
        dispatch(toggleFavoriteError(storableError(err)));
        return Promise.reject(err);
    }

    // Get existing favorites from profile extendedData
    const existingFavorites = currentUser.attributes.profile.publicData.favorites || [];

    let updatedFavorites;
    if (isFav) {
        // add new listingId if not already there
        updatedFavorites = Array.from(new Set([...existingFavorites, listingId]));
    } else {
        // remove listingId
        updatedFavorites = existingFavorites.filter(id => id !== listingId);
    }

    // Save favorites in user profile
    return sdk.currentUser
        .updateProfile({
            publicData: {
                favorites: updatedFavorites,
            },
        })
        .then(response => {
            dispatch(addMarketplaceEntities(response));
            dispatch(toggleFavoriteSuccess(response));

            // ✅ refetch current user so state stays in sync
            return dispatch(fetchCurrentUser());
        })
        .catch(e => {
            dispatch(toggleFavoriteError(storableError(e)));
            throw e;
        });
};