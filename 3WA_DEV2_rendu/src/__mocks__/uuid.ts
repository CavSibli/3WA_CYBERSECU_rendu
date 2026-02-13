// Mock for uuid package to work with Jest
export const v4 = (): string => {
  // Generate a mock UUID-like string for testing
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const v1 = v4;
export const v3 = v4;
export const v5 = v4;
export const v6 = v4;
export const v7 = v4;
export const NIL = '00000000-0000-0000-0000-000000000000';
export const MAX = 'ffffffff-ffff-ffff-ffff-ffffffffffff';
export const validate = (uuid: string): boolean => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid);
};
export const version = (uuid: string): number | undefined => {
  if (!validate(uuid)) return undefined;
  return parseInt(uuid[14], 16);
};
export const parse = (uuid: string): Uint8Array => {
  const bytes = new Uint8Array(16);
  uuid.replace(/[^0-9a-f]/gi, '').split('').forEach((char, i) => {
    if (i < 32) {
      bytes[Math.floor(i / 2)] |= parseInt(char, 16) << (4 * (1 - (i % 2)));
    }
  });
  return bytes;
};
export const stringify = (bytes: Uint8Array): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c, i) => {
    const byteIndex = Math.floor(i / 2);
    const byte = bytes[byteIndex] || 0;
    const value = c === 'x' ? (byte >> (4 * (1 - (i % 2)))) & 0xf : ((byte >> (4 * (1 - (i % 2)))) & 0x3) | 0x8;
    return value.toString(16);
  });
};
