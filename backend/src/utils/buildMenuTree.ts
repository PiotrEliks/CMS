type UUID = string;

export type MenuItemDTO = {
  menu_item_id: UUID;
  label: string;
  order_index: number;
  parent_id: UUID | null;
  content_slug?: string | null;
  external_url?: string | null;
  children?: MenuItemDTO[];
};

export function buildMenuTree(items: MenuItemDTO[]): MenuItemDTO[] {
  const map = new Map<string, MenuItemDTO>();
  items.forEach((i) => map.set(i.menu_item_id, { ...i, children: [] }));

  const roots: MenuItemDTO[] = [];
  map.forEach((item) => {
    if (item.parent_id && map.has(item.parent_id)) {
      map.get(item.parent_id)!.children!.push(item);
    } else {
      roots.push(item);
    }
  });

  const sortTree = (nodes: MenuItemDTO[]) => {
    nodes.sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
    nodes.forEach((n) => n.children && sortTree(n.children));
  };
  sortTree(roots);

  return roots;
}
