
const reducer = (state, action) => {
    switch(action.type){
        case "LOGIN":
            return {
                ...state, isAuthenticated: true
            }
        default:
            return state;

    }
}

export default reducer;
