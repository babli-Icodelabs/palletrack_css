import { fetchPageAssets } from '../../ducks/hostedAssets.duck';
import { fetchCurrentUser } from '../../ducks/user.duck';
import { storableError } from '../../util/errors';
import { uploadImage } from '../ProfileSettingsPage/ProfileSettingsPage.duck';
export const TOS_ASSET_NAME = 'terms-of-service';
export const PRIVACY_POLICY_ASSET_NAME = 'privacy-policy';

export const UPLOAD_IMAGE_REQUEST = 'app/AuthenticationPage/UPLOAD_IMAGE_REQUEST';
export const UPLOAD_IMAGE_SUCCESS = 'app/AuthenticationPage/UPLOAD_IMAGE_SUCCESS';
export const UPLOAD_IMAGE_ERROR = 'app/AuthenticationPage/UPLOAD_IMAGE_ERROR';
export const REMOVE_IMAGE_SUCCESS = 'app/AuthenticationPage/REMOVE_IMAGE_SUCCESS';

const initialState = {
  image: null,
  previewUrl: null,
  uploadImageError: null,
  uploadInProgress: false,
  updateInProgress: false,
};

export const uploadImageRequest = params => ({ type: UPLOAD_IMAGE_REQUEST, payload: { params } });
export const uploadImageSuccess = result => ({ type: UPLOAD_IMAGE_SUCCESS, payload: result.data });
export const uploadImageError = error => ({
  type: UPLOAD_IMAGE_ERROR,
  payload: error,
  error: true,
});
export const clearImage = () => ({ type: REMOVE_IMAGE_SUCCESS });

export default function reducer(state = initialState, action = {}) {
  const { type, payload } = action;
  switch (type) {
    case UPLOAD_IMAGE_REQUEST:
      return {
        ...state,
        image: { ...payload.params },
        uploadInProgress: true,
        uploadImageError: null,
        previewUrl: null,
      };
    case UPLOAD_IMAGE_SUCCESS: {
      const { previewUrl, data } = payload;
      return { ...state, image: data, previewUrl, uploadInProgress: false };
    }
    case UPLOAD_IMAGE_ERROR: {
      return { ...state, image: null, uploadInProgress: false, uploadImageError: payload.error, previewUrl: null, };
    }
    case REMOVE_IMAGE_SUCCESS:
      return { ...state, image: null, previewUrl: null };
    default:
      return state;
  }
}

// Save image data in state
export const saveImage = actionPayload => (dispatch, getState, sdk) => {
  try {
    dispatch(uploadImageRequest(actionPayload));
    const objectUrl = URL.createObjectURL(actionPayload.file);
    dispatch(uploadImageSuccess({ data: { previewUrl: objectUrl, data: actionPayload } }));
  } catch (error) {
    dispatch(uploadImageError({ error: storableError(error) }))
  }
}

export const uploadProfileImage = (payload) => (dispatch, getState, sdk) => {
  dispatch(uploadImage(payload))
    .then(async () => {
      const { uploadedImage } = getState().ProfileSettingsPage.image || {};

      const updatedValues =
        uploadedImage && uploadedImage.id.uuid && uploadedImage.attributes.variants
          ? { profileImageId: uploadedImage.id }
          : {};

      await sdk
        .currentUser
        .updateProfile(updatedValues)
        .then(response => {
          dispatch(fetchCurrentUser())
          return response
        })
        .catch(e => {
          dispatch(uploadImageError({ error: storableError(e) }))
          return;
        });
    })
}

export const loadData = (params, search) => dispatch => {
  const pageAsset = {
    termsOfService: `content/pages/${TOS_ASSET_NAME}.json`,
    privacyPolicy: `content/pages/${PRIVACY_POLICY_ASSET_NAME}.json`,
  };
  return dispatch(fetchPageAssets(pageAsset, true));
};
