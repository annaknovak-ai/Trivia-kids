import styles from "./TextInput.module.css";

type TextInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  ariaLabel?: string;
  id?: string;
};

export default function TextInput({
  value,
  onChange,
  placeholder,
  maxLength,
  ariaLabel,
  id,
}: TextInputProps) {
  return (
    <input
      id={id}
      type="text"
      className={styles.input}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      maxLength={maxLength}
      aria-label={ariaLabel}
      autoComplete="off"
      enterKeyHint="go"
    />
  );
}
