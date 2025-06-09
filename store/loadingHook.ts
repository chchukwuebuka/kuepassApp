
"use client";
import { useDispatch } from 'react-redux';
import { showLoading, hideLoading } from './loadingSlice';
import { AppDispatch } from './store'; // Adjust import path if needed

// Define useAppDispatch if it's not already exported from your store
const useAppDispatch = () => useDispatch<AppDispatch>();

export const useLoadingState = () => {
  const dispatch = useAppDispatch();

  const startLoading = () => {
    dispatch(showLoading());
  };

  const stopLoading = () => {
    dispatch(hideLoading());
  };

  // Updated to accept a function that returns a promise
  const withLoading = async <T,>(asyncFunction: () => Promise<T>): Promise<T> => {
    try {
      dispatch(showLoading());
      return await asyncFunction();
    } finally {
      dispatch(hideLoading());
    }
  };

  return {
    startLoading,
    stopLoading,
    withLoading,
  };
};