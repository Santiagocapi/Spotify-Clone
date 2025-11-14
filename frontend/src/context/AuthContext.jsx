import React, { createContext, useReducer, useContext, useEffect } from "react";

// This function decides HOW the state changes
export const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN":
      return { user: action.payload }; // The payload will be the object { email, token }
    case "LOGUOT":
      return { user: null };
    default:
      return state;
  }
};

// Create the context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    // the 'state' is the object (e.g., { user: null })
    // the 'dispatch' is the function we use to send "actions" (e.g., dispatch({ type: 'LOGIN', ... }))
    user: null, // The initial state is "nobody is logged in"
  });

  // Keep the user logged in if the page reloads
  // This 'useEffect' is executed ONLY ONCE when the app loads
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));

    if (user) {
        dispatch({ type: 'LOGIN', payload: user });
    }
  }, []) // The empty '[]' means "run only on mount"

  console.log('AuthContext state:', state);

  return (
    <AuthContext.Provider value={{ ...state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};



// We created a "shortcut" so we don't have to import 'useContext' and 'AuthContext'
// everywhere. From now on, we'll only import 'useAuthContext()'.
export const useAuthContext = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw Error('useAuthContext debe usarse dentro de un AuthProvider');
  }

  return context;
};
