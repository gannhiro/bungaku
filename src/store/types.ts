import {RootState} from './store';

export type AppAsyncThunkConfig = {
  state: RootState;
  rejectValue: {
    title: string;
    description: string;
  };
};
