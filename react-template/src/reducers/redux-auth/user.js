import Immutable from 'immutable';
import { createReducer } from 'redux-immutablejs';
import { getCurrentEndpointKey } from '../../utils/session-storage.js';
import * as authActions from '../../actions/redux-auth/authenticate';
import { EMAIL_SIGN_IN_COMPLETE } from '../../actions/redux-auth/email-sign-in';
import { EMAIL_SIGN_UP_COMPLETE } from '../../actions/redux-auth/email-sign-up';
import { SIGN_OUT_COMPLETE, SIGN_OUT_ERROR } from '../../actions/redux-auth/sign-out';
import { OAUTH_SIGN_IN_COMPLETE } from '../../actions/redux-auth/oauth-sign-in';
import { DESTROY_ACCOUNT_COMPLETE } from '../../actions/redux-auth/destroy-account';
import * as ssActions from '../../actions/redux-auth/server';
import { STORE_CURRENT_ENDPOINT_KEY, SET_ENDPOINT_KEYS } from '../../actions/redux-auth/configure';
import { SET_PERMISSIONS } from '../../actions/redux-auth/permissions';

const initialState = Immutable.fromJS({
  attributes: null,
  isSignedIn: false,
  firstTimeLogin: false,
  mustResetPassword: false,
  endpointKey: null,
  role: null,
  permissions: []
});

export default createReducer(initialState, {
  [authActions.AUTHENTICATE_COMPLETE]: (state, { user }) => state.merge({
    attributes: user,
    isSignedIn: true,
    endpointKey: getCurrentEndpointKey()
  }),

  [SET_PERMISSIONS]: (state, { role, permissions} ) => {
    return state.merge({
      role: role,
      permissions: permissions,
    });
  },

  [ssActions.SS_TOKEN_VALIDATION_COMPLETE]: (
    state,
    { user, mustResetPassword, firstTimeLogin }
  ) => {
    return state.merge({
      attributes: user,
      isSignedIn: true,
      firstTimeLogin,
      mustResetPassword
    });
  },

  [STORE_CURRENT_ENDPOINT_KEY]: (
    state,
    {currentEndpointKey}
  ) => state.set('endpointKey', currentEndpointKey),
  [SET_ENDPOINT_KEYS]: (
    state, {currentEndpointKey}
  ) => state.set('endpointKey', currentEndpointKey),

  [EMAIL_SIGN_IN_COMPLETE]: (state, { endpoint, user }) => {
    return (state.merge({
      attributes: user,
      isSignedIn: true,
      endpointKey: endpoint
    }));
  },

  [EMAIL_SIGN_UP_COMPLETE]: (state, { endpoint, user }) => {
    // if registration does not require confirmation, user will be signed in at
    // this point.
    return (user.uid)
      ? state.merge({
        attributes: user,
        isSignedIn: true,
        endpointKey: endpoint
      })
      : state;
  },

  [OAUTH_SIGN_IN_COMPLETE]: (state, { endpoint, user }) => state.merge({
    attributes: user,
    isSignedIn: true,
    endpointKey: endpoint
  }),

  [ssActions.SS_AUTH_TOKEN_UPDATE]: (state, {user, mustResetPassword, firstTimeLogin}) => {
    return state.merge({
      mustResetPassword,
      firstTimeLogin,
      isSignedIn: !!user,
      attributes: user
    });
  },

  [authActions.AUTHENTICATE_FAILURE]:    (state) => state.merge(initialState),
  [ssActions.SS_TOKEN_VALIDATION_ERROR]: (state) => state.merge(initialState),
  [SIGN_OUT_COMPLETE]:                   (state) => state.merge(initialState),
  [SIGN_OUT_ERROR]:                      (state) => state.merge(initialState),
  [DESTROY_ACCOUNT_COMPLETE]:            (state) => state.merge(initialState)
});
