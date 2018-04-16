import { answerSortTypes } from './';

const defaultState = {
  activeOption: 'createdAt'
}

export default (state = defaultState.activeOption, action) => {
  switch (action.type) {
    case answerSortTypes.SET_ANSWER_SORT:
      return action.value; 
    default:
      return state;
  }
};
