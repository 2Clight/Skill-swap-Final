import React from "react";

export const Card = ({ children, className = "" }) => {
  return (
    <div className={`bg-gray-800 shadow-lg rounded-xl p-6 ${className}`}>
      {children}
    </div>
  );
};
export const CardContent = ({ children, className = "" }) => {
    return <div className={`text-gray-100 ${className}`}>{children}</div>;
  };


