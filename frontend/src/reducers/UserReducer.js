import { ActionTypes } from "const";

const initialState = {
  name: "",
  staking_done: false,
  win_count: 0,
  lost_count: 0,
  game: null,
  staking_amount: -1,
};

export default function (state = initialState, action) {
  switch (action.type) {
    case ActionTypes.SET_USER: {
      return Object.assign({}, state, {
        // If the name is not specified, do not change it
        // The places that will change the name is login
        // In that cases, the `win_count`, `lost_count`, `game` will be reset
        name: typeof action.name === "undefined" ? state.name : action.name,
        staking_done:
          typeof action.staking_done === "undefined"
            ? state.staking_done
            : action.staking_done,
        win_count:
          typeof action.win_count === "undefined"
            ? state.win_count
            : action.win_count,
        lost_count:
          typeof action.win_count === "undefined"
            ? state.lost_count
            : action.lost_count,
        game:
          typeof action.win_count === "undefined" ? state.game : action.game,
        staking_amount:
          typeof action.staking_amount === "undefined"
            ? state.staking_amount
            : action.staking_amount,
      });
    }
    default:
      return state;
  }
}
