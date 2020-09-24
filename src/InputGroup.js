import React from "react";

export const InputGroup = ({ value, label, type, onChange, options }) => {
  return (
    <div className="input-group">
      <label>{label}</label>
      <input value={value} type={type} onChange={onChange} {...options} />
    </div>
  );
};
