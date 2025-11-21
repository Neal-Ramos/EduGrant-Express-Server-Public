export function normalizeString(input: string): string {
  if (!input) return '';

  return (
    input
      .normalize('NFKD') // Unicode normalization
      // Fix common mojibake (UTF-8 ↔ Windows-1252)
      .replace(/â/g, "'")
      .replace(/â|â/g, '"')
      .replace(/â|â/g, '-')
      .replace(/â¦/g, '...')
      .replace(/â€¢/g, '-')

      // Replace curly quotes with straight ones
      .replace(/[‘’]/g, "'")
      .replace(/[“”]/g, '"')

      // Remove invisible / control characters
      .replace(/[\x00-\x1F\x7F]/g, '')

      // Remove non-ASCII leftovers
      .replace(/[^\x00-\x7F]/g, '')

      // Remove or replace characters unsafe for storage keys
      .replace(/[<>:"/\\|?*]/g, '') // forbidden in filesystems
      .replace(/["']/g, '') // remove quotes entirely
      .replace(/[&%$#@!+=,;]/g, '') // remove other unsafe symbols

      // Replace multiple spaces or underscores with one
      .replace(/\s+/g, ' ')

      // Replace spaces with underscores for file paths
      .replace(/ /g, '_')

      // Trim final result
      .trim()
  );
}
