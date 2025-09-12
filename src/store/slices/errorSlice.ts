import {createSlice} from '@reduxjs/toolkit';
import {PayloadAction} from '@reduxjs/toolkit';
import type {RootState} from '../store';
import {gen_error, internal_gen_error} from '../../api/types';

const initialState: {error: gen_error | internal_gen_error | null} = {
  error: null,
};

export const errorSlice = createSlice({
  name: 'error',
  initialState: initialState,
  reducers: {
    setError: (state, action: PayloadAction<gen_error | internal_gen_error | null>) => {
      state.error = action.payload;
    },
  },
});

export const {setError} = errorSlice.actions;
export const error = (state: RootState) => state.error;
export default errorSlice.reducer;
