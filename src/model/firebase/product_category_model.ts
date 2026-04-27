//상품 카테고리 관리용

export type ProductCategoryItemMap = {
  name: string;
  slug: string;
  order: number;
};

export type ProductCategoryMap = {
  id: string;
  name: string;
  order: number;
  items: ProductCategoryItemMap[];
  isActive: boolean;
};

export class ProductCategoryItemModel {
  constructor(
    public name: string,
    public slug: string,
    public order: number = 0
  ) {}

  static fromMap(map: Partial<ProductCategoryItemMap>): ProductCategoryItemModel {
    return new ProductCategoryItemModel(
      map.name ?? "",
      map.slug ?? "",
      map.order ?? 0
    );
  }

  toMap(): ProductCategoryItemMap {
    return {
      name: this.name,
      slug: this.slug,
      order: this.order,
    };
  }
}

export class ProductCategoryModel {
  constructor(
    public id: string,
    public name: string,
    public order: number = 0,
    public items: ProductCategoryItemModel[] = [],
    public isActive: boolean = true
  ) {}

  static fromMap(map: Partial<ProductCategoryMap>, id?: string): ProductCategoryModel {
    return new ProductCategoryModel(
      id ?? map.id ?? "",
      map.name ?? "",
      map.order ?? 0,
      (map.items ?? []).map((item) => ProductCategoryItemModel.fromMap(item)),
      map.isActive ?? true
    );
  }

  toMap(): ProductCategoryMap {
    return {
      id: this.id,
      name: this.name,
      order: this.order,
      items: this.items.map((item) => item.toMap()),
      isActive: this.isActive,
    };
  }

  copyWith(data: Partial<ProductCategoryMap>): ProductCategoryModel {
    return new ProductCategoryModel(
      data.id ?? this.id,
      data.name ?? this.name,
      data.order ?? this.order,
      data.items
        ? data.items.map((item) => ProductCategoryItemModel.fromMap(item))
        : this.items,
      data.isActive ?? this.isActive
    );
  }
}