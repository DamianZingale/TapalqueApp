import React from "react";
import { Form } from "react-bootstrap";

interface SearchInputProps {
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export const SearchInput: React.FC<SearchInputProps> = ({ 
  value, 
  onChange, 
  onKeyDown,
  placeholder
}) => {
  return (
    <Form.Control
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKeyDown}
    />
  );
};