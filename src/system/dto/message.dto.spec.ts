import { MessageDTO } from './message.dto';

describe('MessageDTO', () => {
  it('should create an instance of MessageDTO', () => {
    const dto = new MessageDTO();
    dto.message = 'Test message';

    expect(dto).toBeInstanceOf(MessageDTO);
    expect(dto.message).toBe('Test message');
  });
});
