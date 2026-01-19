/**
 * Clipboard utilities with fallback support for older browsers
 */

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    // Modern clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    } catch (err) {
      document.body.removeChild(textArea);
      return false;
    }
  } catch (err) {
    console.error('Failed to copy text:', err);
    return false;
  }
}

export function getCopyText(taxonName: string, includeDefinition = false): string {
  if (includeDefinition) {
    // For full specification, we'd need the full taxon object
    // This is a placeholder - will be extended
    return taxonName;
  }
  return taxonName;
}


