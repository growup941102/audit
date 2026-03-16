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

export const dataCatalogs: DataCatalogItem[] = [
  {
    description: '产品规范、术语与常见问题整理',
    id: 'catalog-product-common',
    name: '产品通用数据目录'
  },
  {
    description: '交付流程、模板与验收标准',
    id: 'catalog-delivery',
    name: '项目交付数据目录'
  },
  {
    description: '故障排查路径与服务规范',
    id: 'catalog-tech-support',
    name: '技术支持数据目录'
  }
];

export const projectTreeByCatalogId: Record<string, ProjectNodeItem[]> = {
  'catalog-delivery': [
    {
      catalogId: 'catalog-delivery',
      children: [
        {
          catalogId: 'catalog-delivery',
          fileExt: 'PDF',
          fileSizeLabel: '800KB',
          id: 'delivery-1-1',
          name: '项目交付流程.pdf',
          parentId: 'delivery-1',
          type: 'file'
        },
        {
          catalogId: 'catalog-delivery',
          fileExt: 'XLSX',
          fileSizeLabel: '340KB',
          id: 'delivery-1-2',
          name: '交付检查清单.xlsx',
          parentId: 'delivery-1',
          type: 'file'
        }
      ],
      id: 'delivery-1',
      itemCount: 2,
      name: '交付流程',
      parentId: null,
      type: 'folder'
    },
    {
      catalogId: 'catalog-delivery',
      children: [
        {
          catalogId: 'catalog-delivery',
          fileExt: 'DOCX',
          fileSizeLabel: '1.0MB',
          id: 'delivery-2-1',
          name: '验收报告模板.docx',
          parentId: 'delivery-2',
          type: 'file'
        },
        {
          catalogId: 'catalog-delivery',
          fileExt: 'PPTX',
          fileSizeLabel: '2.1MB',
          id: 'delivery-2-2',
          name: '项目复盘模板.pptx',
          parentId: 'delivery-2',
          type: 'file'
        }
      ],
      id: 'delivery-2',
      itemCount: 2,
      name: '模板中心',
      parentId: null,
      type: 'folder'
    }
  ],
  'catalog-product-common': [
    {
      catalogId: 'catalog-product-common',
      children: [
        {
          catalogId: 'catalog-product-common',
          children: [
            {
              catalogId: 'catalog-product-common',
              fileExt: 'PDF',
              fileSizeLabel: '2.4MB',
              id: 'product-1-1-1',
              name: '产品术语手册.pdf',
              parentId: 'product-1-1',
              type: 'file'
            },
            {
              catalogId: 'catalog-product-common',
              fileExt: 'DOCX',
              fileSizeLabel: '1.1MB',
              id: 'product-1-1-2',
              name: '功能说明文档.docx',
              parentId: 'product-1-1',
              type: 'file'
            }
          ],
          id: 'product-1-1',
          itemCount: 2,
          name: '名词与规格',
          parentId: 'product-1',
          type: 'folder'
        },
        {
          catalogId: 'catalog-product-common',
          children: [
            {
              catalogId: 'catalog-product-common',
              fileExt: 'PDF',
              fileSizeLabel: '900KB',
              id: 'product-1-2-1',
              name: '流程审批规范.pdf',
              parentId: 'product-1-2',
              type: 'file'
            },
            {
              catalogId: 'catalog-product-common',
              fileExt: 'DOCX',
              fileSizeLabel: '560KB',
              id: 'product-1-2-2',
              name: '流程变更说明.docx',
              parentId: 'product-1-2',
              type: 'file'
            }
          ],
          id: 'product-1-2',
          itemCount: 2,
          name: '流程规范',
          parentId: 'product-1',
          type: 'folder'
        }
      ],
      id: 'product-1',
      itemCount: 2,
      name: '基础规范',
      parentId: null,
      type: 'folder'
    },
    {
      catalogId: 'catalog-product-common',
      children: [
        {
          catalogId: 'catalog-product-common',
          fileExt: 'DOCX',
          fileSizeLabel: '640KB',
          id: 'product-2-1',
          name: '运维问题清单.docx',
          parentId: 'product-2',
          type: 'file'
        },
        {
          catalogId: 'catalog-product-common',
          fileExt: 'PDF',
          fileSizeLabel: '1.3MB',
          id: 'product-2-2',
          name: '服务常见问题.pdf',
          parentId: 'product-2',
          type: 'file'
        }
      ],
      id: 'product-2',
      itemCount: 2,
      name: '运营 FAQ',
      parentId: null,
      type: 'folder'
    },
    {
      catalogId: 'catalog-product-common',
      children: [
        {
          catalogId: 'catalog-product-common',
          fileExt: 'XLSX',
          fileSizeLabel: '300KB',
          id: 'product-3-1',
          name: '产品版本策略.xlsx',
          parentId: 'product-3',
          type: 'file'
        },
        {
          catalogId: 'catalog-product-common',
          fileExt: 'PDF',
          fileSizeLabel: '1.0MB',
          id: 'product-3-2',
          name: '定价策略说明.pdf',
          parentId: 'product-3',
          type: 'file'
        },
        {
          catalogId: 'catalog-product-common',
          fileExt: 'DOCX',
          fileSizeLabel: '500KB',
          id: 'product-3-3',
          name: '产品策略复盘.docx',
          parentId: 'product-3',
          type: 'file'
        }
      ],
      id: 'product-3',
      itemCount: 3,
      name: '产品策略',
      parentId: null,
      type: 'folder'
    },
    {
      catalogId: 'catalog-product-common',
      fileExt: 'TXT',
      fileSizeLabel: '120KB',
      id: 'product-4',
      name: '发布规范.txt',
      parentId: null,
      type: 'file'
    }
  ],
  'catalog-tech-support': [
    {
      catalogId: 'catalog-tech-support',
      children: [
        {
          catalogId: 'catalog-tech-support',
          fileExt: 'PDF',
          fileSizeLabel: '700KB',
          id: 'support-1-1',
          name: '排障路径图.pdf',
          parentId: 'support-1',
          type: 'file'
        },
        {
          catalogId: 'catalog-tech-support',
          fileExt: 'DOCX',
          fileSizeLabel: '420KB',
          id: 'support-1-2',
          name: '故障归因说明.docx',
          parentId: 'support-1',
          type: 'file'
        }
      ],
      id: 'support-1',
      itemCount: 2,
      name: '故障排查',
      parentId: null,
      type: 'folder'
    },
    {
      catalogId: 'catalog-tech-support',
      children: [
        {
          catalogId: 'catalog-tech-support',
          fileExt: 'PDF',
          fileSizeLabel: '380KB',
          id: 'support-2-1',
          name: '服务等级协议.pdf',
          parentId: 'support-2',
          type: 'file'
        },
        {
          catalogId: 'catalog-tech-support',
          fileExt: 'XLSX',
          fileSizeLabel: '250KB',
          id: 'support-2-2',
          name: '值班规范.xlsx',
          parentId: 'support-2',
          type: 'file'
        }
      ],
      id: 'support-2',
      itemCount: 2,
      name: '服务规范',
      parentId: null,
      type: 'folder'
    }
  ]
};

export function flattenProjectNodes(nodes: ProjectNodeItem[]): ProjectNodeItem[] {
  return nodes.flatMap(node => [node, ...flattenProjectNodes(node.children || [])]);
}
