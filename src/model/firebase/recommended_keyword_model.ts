export type RecommendedKeywordMap = {
  id: string;
  keyword: string;
  order: number;
  isActive: boolean;
};

export class RecommendedKeywordModel {
  constructor(
    public id: string,
    public keyword: string,
    public order: number = 0,
    public isActive: boolean = true
  ) {}

  static fromMap(
    map: Partial<RecommendedKeywordMap>,
    id?: string
  ): RecommendedKeywordModel {
    return new RecommendedKeywordModel(
      id ?? map.id ?? "",
      map.keyword ?? "",
      map.order ?? 0,
      map.isActive ?? true
    );
  }

  toMap(): RecommendedKeywordMap {
    return {
      id: this.id,
      keyword: this.keyword,
      order: this.order,
      isActive: this.isActive,
    };
  }

  copyWith(data: Partial<RecommendedKeywordMap>): RecommendedKeywordModel {
    return new RecommendedKeywordModel(
      data.id ?? this.id,
      data.keyword ?? this.keyword,
      data.order ?? this.order,
      data.isActive ?? this.isActive
    );
  }
}