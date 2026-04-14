import { logDebug, logWarn, logError } from '../src/shared/logger';

describe('logger', () => {
  it('logDebug writes to console.log in dev mode', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation();
    logDebug('test message');
    expect(spy).toHaveBeenCalledWith('[WebPPT]', 'test message');
    spy.mockRestore();
  });

  it('logWarn writes to console.warn in dev mode', () => {
    const spy = jest.spyOn(console, 'warn').mockImplementation();
    logWarn('warn message');
    expect(spy).toHaveBeenCalledWith('[WebPPT]', 'warn message');
    spy.mockRestore();
  });

  it('logError writes to console.error in dev mode', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation();
    logError('error message');
    expect(spy).toHaveBeenCalledWith('[WebPPT]', 'error message');
    spy.mockRestore();
  });

  it('logDebug accepts multiple arguments', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation();
    logDebug('key:', 'value', 42);
    expect(spy).toHaveBeenCalledWith('[WebPPT]', 'key:', 'value', 42);
    spy.mockRestore();
  });
});
