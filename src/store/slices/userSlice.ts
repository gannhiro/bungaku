import {createSlice} from '@reduxjs/toolkit';
import {PayloadAction} from '@reduxjs/toolkit';
import type {RootState} from '../store';
import {res_get_user_me} from '../../api/types';

export type User = {
  userDetails: res_get_user_me | null;
};

const initialState: User = {userDetails: null};

export const userSlice = createSlice({
  name: 'user',
  initialState: initialState,
  reducers: {
    setUserDetails: (state, action: PayloadAction<res_get_user_me | null>) => {
      state.userDetails = action.payload;
    },
  },
});

export const {setUserDetails} = userSlice.actions;
export const user = (state: RootState) => state.user;
export default userSlice.reducer;
