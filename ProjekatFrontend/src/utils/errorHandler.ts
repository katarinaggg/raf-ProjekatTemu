import type { ApiError, ErrorCode } from '@/api/client'

function mapCodeToMessage(code: ErrorCode): string {
  switch (code) {
    case 'DUPLICATE_USERNAME':
      return 'This username is already taken.'
    case 'BAD_IMAGE_DATA':
      return 'Image data is invalid. Try another image.'
    case 'LOGGED_IN':
      return 'You are already logged in.'
    case 'INCORRECT_CREDENTIALS':
      return 'Wrong username or password.'
    case 'INVALID_DATA':
      return 'Some of the submitted data is invalid.'
    case 'NO_SUCH_ENTITY':
      return 'Requested resource does not exist.'
    case 'NOT_YOURS':
      return 'You are not allowed to modify this item.'
    case 'NOT_AUTHENTICATED':
      return 'You must be logged in to perform this action.'
    case 'OUT_OF_STOCK':
      return 'This product is out of stock.'
    case 'INTERNAL_ERROR':
      return 'Server error. Please try again later.'
    default:
      return 'Unexpected error.'
  }
}

export function getErrorMessage(err: unknown): string {
  // očekujemo failed + code
  if (typeof err === 'object' && err !== null && 'code' in err) {
    const apiErr = err as ApiError
    return mapCodeToMessage(apiErr.code)
  }

  return 'Network error or unexpected problem.'
}
