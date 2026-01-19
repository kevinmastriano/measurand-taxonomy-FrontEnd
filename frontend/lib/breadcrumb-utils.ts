/**
 * Utilities for generating breadcrumb paths from taxon names
 */

export interface BreadcrumbItem {
  label: string;
  path: string;
  isLast: boolean;
}

/**
 * Generate breadcrumb items from a taxon name
 * Example: "Measure.Temperature.PRT" -> ["Measure", "Measure.Temperature", "Measure.Temperature.PRT"]
 */
export function generateBreadcrumbsFromTaxon(taxonName: string, basePath = '/'): BreadcrumbItem[] {
  const parts = taxonName.split('.');
  const breadcrumbs: BreadcrumbItem[] = [];
  
  // Add home
  breadcrumbs.push({
    label: 'Home',
    path: basePath,
    isLast: false,
  });
  
  // Build path progressively
  let currentPath = '';
  parts.forEach((part, index) => {
    currentPath += (currentPath ? '.' : '') + part;
    breadcrumbs.push({
      label: part,
      path: `${basePath}?taxon=${encodeURIComponent(currentPath)}`,
      isLast: index === parts.length - 1,
    });
  });
  
  return breadcrumbs;
}

/**
 * Generate breadcrumb items from a tree path (for tree view)
 */
export function generateBreadcrumbsFromTreePath(path: string[], basePath = '/'): BreadcrumbItem[] {
  const breadcrumbs: BreadcrumbItem[] = [];
  
  // Add home
  breadcrumbs.push({
    label: 'Home',
    path: basePath,
    isLast: false,
  });
  
  // Build path progressively
  let currentPath = '';
  path.forEach((part, index) => {
    currentPath += (currentPath ? '.' : '') + part;
    breadcrumbs.push({
      label: part,
      path: `${basePath}?taxon=${encodeURIComponent(currentPath)}`,
      isLast: index === path.length - 1,
    });
  });
  
  return breadcrumbs;
}

/**
 * Generate breadcrumb for discipline page
 */
export function generateDisciplineBreadcrumb(disciplineName: string): BreadcrumbItem[] {
  return [
    { label: 'Home', path: '/', isLast: false },
    { label: 'Disciplines', path: '/disciplines', isLast: false },
    { label: disciplineName, path: `/disciplines/${encodeURIComponent(disciplineName)}`, isLast: true },
  ];
}

/**
 * Generate breadcrumb for quantity page
 */
export function generateQuantityBreadcrumb(aspect: string, id: string): BreadcrumbItem[] {
  return [
    { label: 'Home', path: '/', isLast: false },
    { label: 'Quantities', path: '/quantities', isLast: false },
    { label: `${aspect} (${id})`, path: `/quantities/${encodeURIComponent(aspect)}/${encodeURIComponent(id)}`, isLast: true },
  ];
}


