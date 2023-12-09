export async function TimeoutWrapper(options: any) {
    const timeoutDuration = options.timeout || 720000; // Default timeout to 10 seconds
    const timeoutId = setTimeout(() => {
      throw new Error('Request timed out');
    }, timeoutDuration);
  
    try {
      const response = await fetch(options.url, {
        method: 'POST',
        headers: options.headers,
        body: options.body,
      });
      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error && error.message === 'Request timed out') {
        console.error('Request to', options.url, 'timed out after', timeoutDuration, 'ms');
      } else {
        throw error;
      }
    } finally {
      clearTimeout(timeoutId);
    }
  };