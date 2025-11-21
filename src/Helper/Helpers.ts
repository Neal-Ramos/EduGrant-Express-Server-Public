export function chunkArray<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}  
export function extractNumber(str: string | undefined | null){
  if(!str) return 0
  if (!/\d/.test(str)) return 0

  const cleaned = str.replace(/[^0-9.-]/g, "")

  const normalized = cleaned
    .replace(/(.*\..*)\./g, "$1")
    .replace(/(.*-.*)-/g, "$1")
  const num = Number(normalized)
  
  return isNaN(num) ? 0 : num
}