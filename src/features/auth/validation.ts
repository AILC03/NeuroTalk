export interface CredentialErrors { name?: string; email?: string; password?: string }
export function utf8Length(value: string) {
  return Array.from(value).reduce((sum, character) => { const code = character.codePointAt(0)!; return sum + (code <= 0x7f ? 1 : code <= 0x7ff ? 2 : code <= 0xffff ? 3 : 4); }, 0);
}
export function validateCredentials(input: { name: string; email: string; password: string }, register: boolean): CredentialErrors {
  const errors: CredentialErrors = {};
  if (register && (!input.name.trim() || input.name.trim().length > 80)) errors.name = "Escribe un nombre de entre 1 y 80 caracteres.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim()) || input.email.trim().length > 254) errors.email = "Escribe un correo válido, por ejemplo usuario@example.test.";
  if (!input.password) errors.password = "Escribe tu contraseña.";
  else if (utf8Length(input.password) > 72) errors.password = "La contraseña supera los 72 bytes permitidos. Prueba con menos caracteres.";
  else if (register && input.password.length < 12) errors.password = "Utiliza al menos 12 caracteres para crear tu contraseña.";
  return errors;
}
