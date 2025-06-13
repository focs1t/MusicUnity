import { combineReducers } from '@reduxjs/toolkit';
import { userReducer } from '../../entities/user';
import { authorReducer } from '../../entities/author';
import { releaseReducer } from '../../entities/release';
import { reviewReducer } from '../../entities/review';
import { genreReducer } from '../../entities/genre';
import { likeReducer } from '../../entities/like';
import { reportReducer } from '../../entities/report';
import { authModel } from '../../entities/auth';

const rootReducer = combineReducers({
  auth: authModel.authReducer,
  user: userReducer,
  author: authorReducer,
  release: releaseReducer,
  review: reviewReducer,
  genre: genreReducer,
  like: likeReducer,
  report: reportReducer
});

export default rootReducer; 