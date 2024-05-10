import {
  createAction,
  createFeatureSelector,
  createReducer,
  createSelector,
  on,
  props
} from '@ngrx/store';

export interface UserItemArray {
  quantity: number;
  item: string;
  cost: number;
}
export interface IUser {
  date: Date;
  origin: string;
  departure: string;
  baggage: string;
  currency: string;
  items: UserItemArray[];
  claim: number;
}
const initialState: IUser = {
  date: new Date(),
  origin: '',
  departure: '',
  baggage: '',
  currency: '',
  items: [],
  claim: 0
}
export const baggageInfo = 'baggageInfo';

export type baggageState = IUser;

export const resetBaggageInfo = createAction('[BaggageInfo] load Baggage info')
export const setBaggageInfo = createAction('[BaggageInfo] set baggage info to store',
  props<{
    model: IUser;
  }>());
export const reducer = createReducer(
  initialState,
  on(setBaggageInfo, (state, payload) => ({
    ...state,
    ...payload.model
  }))
)
export const selectBaggageInfoState = createFeatureSelector<baggageState>(baggageInfo);

export const baggageDetails = createSelector(selectBaggageInfoState, (state: baggageState) => state);