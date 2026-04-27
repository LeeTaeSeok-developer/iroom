export type FAQItemMap = {
  id: string;
  question: string;
  answer: string;
  tags: string[];
  order: number;
  isActive: boolean;
};

export type FAQCategoryMap = {
  id: string;
  label: string;
  order: number;
  isActive: boolean;
  items: FAQItemMap[];
};

export class FAQItemModel {
  constructor(
    public id: string,
    public question: string,
    public answer: string,
    public tags: string[] = [],
    public order: number = 0,
    public isActive: boolean = true
  ) {}

  static fromMap(map: Partial<FAQItemMap>, id?: string): FAQItemModel {
    return new FAQItemModel(
      id ?? map.id ?? "",
      map.question ?? "",
      map.answer ?? "",
      map.tags ?? [],
      map.order ?? 0,
      map.isActive ?? true
    );
  }

  toMap(): FAQItemMap {
    return {
      id: this.id,
      question: this.question,
      answer: this.answer,
      tags: this.tags,
      order: this.order,
      isActive: this.isActive,
    };
  }
}

export class FAQCategoryModel {
  constructor(
    public id: string,
    public label: string,
    public order: number = 0,
    public isActive: boolean = true,
    public items: FAQItemModel[] = []
  ) {}

  static fromMap(map: Partial<FAQCategoryMap>, id?: string): FAQCategoryModel {
    return new FAQCategoryModel(
      id ?? map.id ?? "",
      map.label ?? "",
      map.order ?? 0,
      map.isActive ?? true,
      (map.items ?? []).map((item) => FAQItemModel.fromMap(item))
    );
  }

  toMap(): FAQCategoryMap {
    return {
      id: this.id,
      label: this.label,
      order: this.order,
      isActive: this.isActive,
      items: this.items.map((item) => item.toMap()),
    };
  }

  copyWith(data: Partial<FAQCategoryMap>): FAQCategoryModel {
    return new FAQCategoryModel(
      data.id ?? this.id,
      data.label ?? this.label,
      data.order ?? this.order,
      data.isActive ?? this.isActive,
      data.items
        ? data.items.map((item) => FAQItemModel.fromMap(item))
        : this.items
    );
  }
}