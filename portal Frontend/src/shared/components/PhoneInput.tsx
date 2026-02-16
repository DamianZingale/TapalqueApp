import { Form, InputGroup } from 'react-bootstrap';

const COUNTRY_CODES = [
  { code: '+54 9', country: 'AR', label: '🇦🇷 +54 9' },
  { code: '+598', country: 'UY', label: '🇺🇾 +598' },
  { code: '+55', country: 'BR', label: '🇧🇷 +55' },
  { code: '+56', country: 'CL', label: '🇨🇱 +56' },
  { code: '+595', country: 'PY', label: '🇵🇾 +595' },
  { code: '+591', country: 'BO', label: '🇧🇴 +591' },
  { code: '+51', country: 'PE', label: '🇵🇪 +51' },
  { code: '+57', country: 'CO', label: '🇨🇴 +57' },
  { code: '+593', country: 'EC', label: '🇪🇨 +593' },
  { code: '+58', country: 'VE', label: '🇻🇪 +58' },
  { code: '+1', country: 'US', label: '🇺🇸 +1' },
  { code: '+34', country: 'ES', label: '🇪🇸 +34' },
];

/**
 * Parses a full phone string into { prefix, number }.
 * Tries to match the longest known prefix first.
 */
function parsePhone(full: string): { prefix: string; number: string } {
  const cleaned = full.replace(/[^0-9+]/g, '');
  // Sort codes by length descending so longer prefixes match first
  const sorted = [...COUNTRY_CODES].sort(
    (a, b) => b.code.replace(/\s/g, '').length - a.code.replace(/\s/g, '').length
  );
  for (const c of sorted) {
    const codeClean = c.code.replace(/\s/g, '');
    if (cleaned.startsWith(codeClean)) {
      return { prefix: c.code, number: cleaned.slice(codeClean.length) };
    }
  }
  return { prefix: '+54 9', number: cleaned.replace(/^\+/, '') };
}

interface PhoneInputProps {
  value: string;
  onChange: (fullNumber: string) => void;
  required?: boolean;
  helpText?: string;
}

export function PhoneInput({ value, onChange, required, helpText }: PhoneInputProps) {
  const { prefix, number } = parsePhone(value);

  const handlePrefixChange = (newPrefix: string) => {
    const prefixDigits = newPrefix.replace(/\s/g, '');
    onChange(prefixDigits + number);
  };

  const handleNumberChange = (newNumber: string) => {
    const cleaned = newNumber.replace(/[^0-9]/g, '');
    const prefixDigits = prefix.replace(/\s/g, '');
    onChange(prefixDigits + cleaned);
  };

  return (
    <>
      <InputGroup>
        <Form.Select
          value={prefix}
          onChange={(e) => handlePrefixChange(e.target.value)}
          style={{ maxWidth: '130px', fontSize: '0.85rem' }}
          required={required}
        >
          {COUNTRY_CODES.map((c) => (
            <option key={c.country} value={c.code}>
              {c.label}
            </option>
          ))}
        </Form.Select>
        <Form.Control
          type="tel"
          value={number}
          onChange={(e) => handleNumberChange(e.target.value)}
          placeholder={prefix === '+54 9' ? '11 12345678' : 'Número sin 0'}
          required={required}
        />
      </InputGroup>
      <Form.Text className="text-muted">
        {helpText || 'Sin 0 ni 15. Solo el código de área y número.'}
      </Form.Text>
    </>
  );
}
