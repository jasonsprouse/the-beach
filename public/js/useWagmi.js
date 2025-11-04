// This file will house the wagmi store and related functions.

// Since we are not using a framework like React or Vue, we will create a simple state management system using vanilla JavaScript.

const initialState = {
  isAuthenticated: false,
  pkp: null,
  authMethod: null,
  sessionSigs: null,
};

let state = { ...initialState };

const listeners = new Set();

const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const updateState = (newState) => {
  state = { ...state, ...newState };
  listeners.forEach((listener) => listener(state));
};

const resetState = () => {
  state = { ...initialState };
  listeners.forEach((listener) => listener(state));
};

const useWagmi = () => {
  return {
    get state() {
      return state;
    },
    subscribe,
    updateState,
    resetState,
  };
};

window.useWagmi = useWagmi;
