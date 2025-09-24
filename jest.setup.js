import '@testing-library/jest-dom/extend-expect'
import React from 'react'

jest.mock('next/image', () => ({
  __esModule: true,
  default: React.forwardRef((props, ref) =>
    React.createElement('img', { ...props, ref }),
  ),
}))
