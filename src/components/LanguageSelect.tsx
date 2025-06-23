import React from 'react';
import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { LANGUAGES, DEFAULT_LANGUAGE } from '../constants/languages';

interface LanguageSelectProps {
  value: string;
  onChange: (language: string) => void;
  label?: string;
  variant?: 'standard' | 'outlined' | 'filled';
  size?: 'small' | 'medium';
  fullWidth?: boolean;
}

const LanguageSelect: React.FC<LanguageSelectProps> = ({
  value,
  onChange,
  label = 'Language',
  variant = 'outlined',
  size = 'medium',
  fullWidth = false
}) => {
  const handleChange = (event: SelectChangeEvent<string>) => {
    onChange(event.target.value);
  };

  return (
    <FormControl variant={variant} size={size} fullWidth={fullWidth}>
      <InputLabel>{label}</InputLabel>
      <Select
        value={value || DEFAULT_LANGUAGE}
        onChange={handleChange}
        label={label}
      >
        {LANGUAGES.map((language) => (
          <MenuItem key={language.code} value={language.code}>
            {language.name} ({language.nativeName})
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default LanguageSelect;