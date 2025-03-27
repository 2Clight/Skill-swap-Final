import React from "react";

export const Button = ({ children, variant = "default", className = "", ...props }) => {
  const baseStyles = "px-6 py-2 rounded-lg font-medium transition duration-200";
  const variants = {
    default: "bg-teal-500 text-white hover:bg-teal-600",
    outline: "border border-teal-400 text-teal-400 hover:bg-teal-500 hover:text-white",
    ghost: "text-gray-300 hover:bg-gray-800 hover:text-white",
    secondary: "border border-purple-400 text-purple-400 hover:bg-purple-500 hover:text-white",
    red1: "bg-red-400 text-white hover:bg-red-500",
    red2: "bg-red-500 text-white hover:bg-red-600",
  red3: "bg-red-600 text-white hover:bg-red-700",
  red4: "bg-red-700 text-white hover:bg-red-800",
  red5: "bg-red-800 text-white hover:bg-red-900",
  neutral: "border border-teal-400 text-teal-400 hover:bg-gray-200 hover:text-black",
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};


