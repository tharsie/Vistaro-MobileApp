export function getErrorMessage(error: any, defaultMessage: string = 'An unexpected error occurred.'): string {
  if (error && error.response) {
    const data = error.response.data;

    // 1. Envelope error message
    if (data && typeof data === 'object') {
      if (typeof data.message === 'string' && data.message.trim().length > 0) {
        return data.message;
      }

      // 2. ASP.NET Validation Errors (e.g. ModelState/FluentValidation)
      if (data.errors && typeof data.errors === 'object') {
        const errorList = Object.values(data.errors).flat();
        if (errorList.length > 0) {
          return errorList.map((err) => String(err)).join('\n');
        }
      }

      if (typeof data.title === 'string' && data.title.trim().length > 0) {
        return data.title;
      }
    }
  }

  if (error && error.message) {
    if (error.message === 'Network Error') {
      return 'Unable to connect. Check your internet connection or server availability.';
    }
    return error.message;
  }

  return defaultMessage;
}
