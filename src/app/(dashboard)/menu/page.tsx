import { prisma } from "@/lib/prisma";
import { requireStoreId } from "@/lib/current-store";
import { AddCategoryForm } from "@/components/add-category-form";
import { AddMenuItemForm } from "@/components/add-menu-item-form";
import { MenuItemRow } from "@/components/menu-item-row";
import { CategoryNameEditor } from "@/components/category-name-editor";

export default async function MenuPage() {
  const storeId = await requireStoreId();

  const categories = await prisma.menuCategory.findMany({
    where: { storeId },
    orderBy: { sortOrder: "asc" },
    include: {
      menuItems: { orderBy: { sortOrder: "asc" } },
    },
  });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-neutral-100">メニュー管理</h1>
        <AddCategoryForm />
      </div>

      <div className="space-y-4">
        {categories.map((category) => (
          <div
            key={category.id}
            className="rounded-md border border-neutral-800 bg-neutral-900 p-3"
          >
            <CategoryNameEditor categoryId={category.id} name={category.name} />
            <ul className="space-y-1">
              {category.menuItems.map((item) => (
                <MenuItemRow key={item.id} item={item} />
              ))}
              {category.menuItems.length === 0 && (
                <li className="text-sm text-neutral-500">商品がありません</li>
              )}
            </ul>
            <AddMenuItemForm categoryId={category.id} />
          </div>
        ))}
        {categories.length === 0 && (
          <p className="text-neutral-500">
            カテゴリーがありません。上のフォームから追加してください。
          </p>
        )}
      </div>
    </div>
  );
}
