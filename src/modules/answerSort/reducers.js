import { answerSortTypes } from './';

const defaultState = {
  activeOption: 'createdAt'
}

export default (state = defaultState, action) => {
  switch (action.type) {
    case answerSortTypes.SET_ANSWER_SORT:
      const newState = Object.assign({}, state, {activeOption: action.value})
      console.log(newState.activeOption)
      return newState.activeOption;

    default:
      return state;
  }
};
