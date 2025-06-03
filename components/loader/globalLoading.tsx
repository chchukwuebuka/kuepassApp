"use client";
import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import Loading from "./loader"; 

const GlobalLoading: React.FC = () => {
  const isLoading = useSelector((state: RootState) => state.loading.isLoading);

  if (!isLoading) return null;

  return (
    <div className="global-loader-overlay">
      <Loading />
    </div>
  );
};

export default GlobalLoading;