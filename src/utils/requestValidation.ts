export function validateRequest(time: string, message: string) {
  const errors: string[] = [];

  const date = new Date(time);
  if (isNaN(date.getTime())) {
    errors.push('time must be a valid date string');
  }

  if (typeof message !== 'string' || message.length < 1) {
    errors.push('message must be a non-empty string');
  }

  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}
