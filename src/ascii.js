export const ASCII = Array.from({ length: 256 }, (_, i) => {
  if (i > 31 && i !== 127 && i !== 173) return String.fromCharCode(i);
  return "";
});
