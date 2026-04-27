export type ProductQuestionItemMap = {
  id: string;
  question: string;
  answer: string;
  order: number;
  isActive: boolean;
};

export type ProductQuestionSetMap = {
  id: string;
  productName: string;
  productId: string;
  items: ProductQuestionItemMap[];
  isActive: boolean;
};

export class ProductQuestionItemModel {
  constructor(
    public id: string,
    public question: string,
    public answer: string,
    public order: number = 0,
    public isActive: boolean = true
  ) {}

  static fromMap(
    map: Partial<ProductQuestionItemMap>,
    id?: string
  ): ProductQuestionItemModel {
    return new ProductQuestionItemModel(
      id ?? map.id ?? "",
      map.question ?? "",
      map.answer ?? "",
      map.order ?? 0,
      map.isActive ?? true
    );
  }

  toMap(): ProductQuestionItemMap {
    return {
      id: this.id,
      question: this.question,
      answer: this.answer,
      order: this.order,
      isActive: this.isActive,
    };
  }
}

export class ProductQuestionSetModel {
  constructor(
    public id: string,
    public productName: string,
    public productId: string,
    public items: ProductQuestionItemModel[] = [],
    public isActive: boolean = true
  ) {}

  static fromMap(
    map: Partial<ProductQuestionSetMap>,
    id?: string
  ): ProductQuestionSetModel {
    return new ProductQuestionSetModel(
      id ?? map.id ?? "",
      map.productName ?? "",
      map.productId ?? "",
      (map.items ?? []).map((item) =>
        ProductQuestionItemModel.fromMap(item)
      ),
      map.isActive ?? true
    );
  }

  toMap(): ProductQuestionSetMap {
    return {
      id: this.id,
      productName: this.productName,
      productId: this.productId,
      items: this.items.map((item) => item.toMap()),
      isActive: this.isActive,
    };
  }

  copyWith(data: Partial<ProductQuestionSetMap>): ProductQuestionSetModel {
    return new ProductQuestionSetModel(
      data.id ?? this.id,
      data.productName ?? this.productName,
      data.productId ?? this.productId,
      data.items
        ? data.items.map((item) => ProductQuestionItemModel.fromMap(item))
        : this.items,
      data.isActive ?? this.isActive
    );
  }
}