import { describe, it, expect } from 'vitest'
import { logger } from '@/lib/logger'

describe('logger', () => {
  it('should exist', () => {
    expect(logger).toBeDefined()
  })

  it('should have log method', () => {
    expect(typeof logger.log).toBe('function')
  })

  it('should have info method', () => {
    expect(typeof logger.info).toBe('function')
  })

  it('should have warn method', () => {
    expect(typeof logger.warn).toBe('function')
  })

  it('should have error method', () => {
    expect(typeof logger.error).toBe('function')
  })

  it('should have debug method', () => {
    expect(typeof logger.debug).toBe('function')
  })
})
