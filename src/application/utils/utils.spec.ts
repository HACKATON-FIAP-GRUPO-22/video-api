import { BusinessRuleException } from '../../system/filtros/business-rule-exception';
import { fieldIsValid, emailIsValid, copyFields, timeInMinutes } from './utils';

describe('Utils Functions', () => {
  describe('fieldIsValid', () => {
    it('should throw BusinessRuleException if field is undefined', () => {
      expect(() => fieldIsValid(undefined, 'Field is required')).toThrow(
        BusinessRuleException,
      );
      expect(() => fieldIsValid(undefined, 'Field is required')).toThrow(
        'Field is required',
      );
    });

    it('should throw BusinessRuleException if field is a negative number', () => {
      expect(() => fieldIsValid(-1, 'Field cannot be negative')).toThrow(
        BusinessRuleException,
      );
      expect(() => fieldIsValid(-1, 'Field cannot be negative')).toThrow(
        'Field cannot be negative',
      );
    });

    it('should throw BusinessRuleException if field is an empty string', () => {
      expect(() => fieldIsValid('', 'Field cannot be empty')).toThrow(
        BusinessRuleException,
      );
      expect(() => fieldIsValid('', 'Field cannot be empty')).toThrow(
        'Field cannot be empty',
      );
    });

    it('should throw BusinessRuleException if field is an empty array', () => {
      expect(() => fieldIsValid([], 'Field cannot be an empty array')).toThrow(
        BusinessRuleException,
      );
      expect(() => fieldIsValid([], 'Field cannot be an empty array')).toThrow(
        'Field cannot be an empty array',
      );
    });

    it('should not throw an error for valid fields', () => {
      expect(() => fieldIsValid(1, 'Field is valid')).not.toThrow();
      expect(() => fieldIsValid('valid', 'Field is valid')).not.toThrow();
      expect(() => fieldIsValid([1, 2, 3], 'Field is valid')).not.toThrow();
    });
  });

  describe('emailIsValid', () => {
    it('should return true for valid email addresses', () => {
      expect(emailIsValid('test@example.com')).toBe(true);
      expect(emailIsValid('user.name+tag+sorting@example.com')).toBe(true);
    });

    it('should return false for invalid email addresses', () => {
      expect(emailIsValid('plainaddress')).toBe(false);
      expect(emailIsValid('@missingusername.com')).toBe(false);
      expect(emailIsValid('username@.com')).toBe(false);
    });
  });

  describe('copyFields', () => {
    it('should copy matching fields from origin to target', () => {
      const origin = { name: 'John', age: 30, city: 'New York' };
      const target = { name: '', age: 0 };

      copyFields(origin, target);

      expect(target).toEqual({ name: 'John', age: 30 });
    });

    it('should not add fields to target that are not present in origin', () => {
      const origin = { name: 'John', age: 30 };
      const target = { name: '', age: 0, city: 'Unknown' };

      copyFields(origin, target);

      expect(target).toEqual({ name: 'John', age: 30, city: 'Unknown' });
    });
  });

  describe('timeInMinutes', () => {
    it('should calculate the correct time difference in minutes', () => {
      const begin = new Date('2023-01-01T10:00:00');
      const end = new Date('2023-01-01T10:30:00');

      const result = timeInMinutes(begin, end);

      expect(result).toBe('30 minuto(s)');
    });

    it('should calculate the correct time difference in hours and minutes', () => {
      const begin = new Date('2023-01-01T08:00:00');
      const end = new Date('2023-01-01T10:45:00');

      const result = timeInMinutes(begin, end);

      expect(result).toBe('2 hora(s) 45 minuto(s)');
    });

    it('should calculate the correct time difference for same times', () => {
      const time = new Date('2023-01-01T10:00:00');

      const result = timeInMinutes(time, time);

      expect(result).toBe('0 minuto(s)');
    });
  });
});
