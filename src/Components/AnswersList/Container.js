import { compose, withStateHandlers, withHandlers, lifecycle, branch, renderComponent } from 'recompose';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { db } from '../../utils';
import _ from 'lodash';

import AppLoader from '../Loaders/AppLoader';
import Component from './Component';

const mapStateToProps = state => ({
  user: state.user,
  sortBy: state.answerSort
  // TODO: CODE FOR YOUR HOMEWORK HERE
});

const enhance = compose(
  connect(mapStateToProps),
  withStateHandlers({ answers: [], users: [], votes: [], isFetching: true }),

  withRouter,

  lifecycle({
    componentWillMount() {
      this.interval = db.pooling(async () => {
        const questionId = this.props.match.params.questionId;

        let answers = await db.answers.find();
        answers = answers.filter(answer => answer.questionId === questionId);

        let votes = await db.votes.find();
        const answerIds = answers.map(a => a._id);
        votes = votes.filter(vote => answerIds.includes(vote.answerId));

        const users = await db.users.find();
        const sortBy = this.props.sortBy;


        let finalAnswers = answers.map(answer => {
          const likes = votes.filter(vote =>
              vote.answerId === answer._id && vote.isPositive === true).length;

          const dislikes = votes.filter(vote => 
              vote.answerId === answer._id && vote.isPositive === false).length;
          return {
            ...answer,
            likes,
            dislikes
          }
        });

        // ~~~ sorting by the creating time ~~~
        if (sortBy === 'createdAt') {
          finalAnswers = _.orderBy(finalAnswers, ['createdAt'], ['asc']).reverse();
        }
        // ~~~ sorting by the likes count ~~~
        if (sortBy === 'best') {
          finalAnswers = _.orderBy(finalAnswers, ['likes'], ['asc']).reverse();
        }
        // ~~~ sorting by the likes count ~~~
        if (sortBy === 'worst') {
          finalAnswers = _.orderBy(finalAnswers, ['dislikes'], ['asc']).reverse();
        }
        this.setState({ answers: finalAnswers, votes, users, isFetching: false });
      });
    },
    componentWillUpdate(nextProps) {
      return this.props.sortBy !== nextProps;
    },
    componentWillUnmount() {
      clearInterval(this.interval);
    }
  }),

  branch(
    ({ isFetching }) => isFetching,
    renderComponent(AppLoader)
  ),

  withHandlers({
    onVote: ({ user }) => (answerId, isPositive) => {
      if (user) {
        db.votes.insert({
          answerId,
          isPositive,
          createdAt: new Date(),
          createdById: user._id,
        });
      }
    }
  }),
);


export default enhance(Component);
