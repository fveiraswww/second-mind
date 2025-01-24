export function logger(...messages: any[]) {
  console.log(`[${new Date().toISOString()}]`, ...messages);
}
