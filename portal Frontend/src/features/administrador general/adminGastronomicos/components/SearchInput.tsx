import React from "react";
import { Form } from "react-bootstrap";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export const SearchInput: React.FC<SearchInputProps> = ({ 
  value, 
  onChange, 
  onKeyDown
}) => {
  return (
    <Form.Control
      type="text"
      placeholder="Buscar ingrediente"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKeyDown}
    />
  );
};