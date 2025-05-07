import React from 'react'
import { createContext, useContext, useReducer } from 'react'
import reducer from '../reducer/Reducer';

const Context = createContext();
const initial = {
    isAuthenticated : sessionStorage.getItem("isLogged") || false
}
const ContextProvider = ({children}) => {

    const [state, dispatch] = useReducer(reducer, initial);

  return (
    <Context.Provider value={{state, dispatch}}>
        {children}
    </Context.Provider>
  );

}

const Provider = () => {
    return useContext(Context)
}

export {ContextProvider, Provider};
