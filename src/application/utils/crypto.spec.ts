import { decryptObject, encryptObject } from './crypto';

describe('Crypto Utility Functions', () => {
  const SECRET_KEY_CRYPTO = 'my_secret_key';
  const mockEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...mockEnv, SECRET_KEY_CRYPTO };
  });

  afterAll(() => {
    process.env = mockEnv;
  });

  describe('encryptObject', () => {
    it('should encrypt an object', () => {
      const object = { name: 'John', age: 30 };

      const encrypted = encryptObject(object);

      expect(encrypted).not.toBe(JSON.stringify(object));
      expect(typeof encrypted).toBe('string');
    });

    it('should produce different encrypted outputs for different objects', () => {
      const object1 = { name: 'John', age: 30 };
      const object2 = { name: 'Jane', age: 25 };

      const encrypted1 = encryptObject(object1);
      const encrypted2 = encryptObject(object2);

      expect(encrypted1).not.toBe(encrypted2);
    });
  });

  describe('decryptObject', () => {
    it('should decrypt an encrypted object and return the original object', () => {
      const object = { name: 'John', age: 30 };

      const encrypted = encryptObject(object);
      const decrypted = decryptObject(encrypted);

      expect(decrypted).toEqual(object);
    });

    it('should throw an error if the decryption fails', () => {
      const invalidEncryptedObject = 'invalid_encrypted_string';

      expect(() => decryptObject(invalidEncryptedObject)).toThrow();
    });
  });

  describe('integration of encryptObject and decryptObject', () => {
    it('should successfully encrypt and decrypt an object', () => {
      const object = { key: 'value', list: [1, 2, 3] };

      const encrypted = encryptObject(object);
      const decrypted = decryptObject(encrypted);

      expect(decrypted).toEqual(object);
    });
  });
});
