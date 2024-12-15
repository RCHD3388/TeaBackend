async function withRetry(fn: Function, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
          return await fn();
      } catch (error) {
          if (error.message.includes('WriteConflict') && attempt < maxRetries - 1) {
              console.log('Retrying transaction...');
              continue;
          }
          throw error;
      }
  }
}

export default withRetry
