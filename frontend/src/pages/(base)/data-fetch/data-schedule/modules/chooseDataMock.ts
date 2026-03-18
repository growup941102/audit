export interface DataCatalogItem {
  description: string;
  id: string;
  name: string;
}

export type ProjectNodeType = 'file' | 'folder';

export interface ProjectNodeItem {
  catalogId: string;
  children?: ProjectNodeItem[];
  fileExt?: string;
  fileSizeLabel?: string;
  id: string;
  itemCount?: number;
  name: string;
  parentId: string | null;
  type: ProjectNodeType;
}

export function flattenProjectNodes(nodes: ProjectNodeItem[]): ProjectNodeItem[] {
  const result: ProjectNodeItem[] = [];

  function walk(items: ProjectNodeItem[]) {
    items.forEach(item => {
      result.push(item);
      if (item.children?.length) {
        walk(item.children);
      }
    });
  }

  walk(nodes);
  return result;
}
