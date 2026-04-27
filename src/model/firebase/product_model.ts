import { Timestamp } from "firebase/firestore";
import { toTimestampOrNull, FirestoreDate } from "./firestore_utils";

export type ProductMap = {
  id: string;
  hashtag: string;
  hashtags: string[];
  brandId: string;
  brandName: string;
  name: string;
  imageUrl: string;
  category: string;
  searchKeywords: string[];
  manualEnabled: boolean;
  questionEnabled: boolean;
  isActive: boolean;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
};

export class ProductModel {
  constructor(
    public id: string,
    public hashtag: string,
    public hashtags: string[],
    public brandId: string,
    public brandName: string,
    public name: string,
    public imageUrl: string,
    public category: string,
    public searchKeywords: string[] = [],
    public manualEnabled: boolean = true,
    public questionEnabled: boolean = true,
    public isActive: boolean = true,
    public createdAt: Timestamp | null = null,
    public updatedAt: Timestamp | null = null
  ) {}

  static fromMap(
    map: Partial<ProductMap> & {
      createdAt?: FirestoreDate;
      updatedAt?: FirestoreDate;
    },
    id?: string
  ): ProductModel {
    return new ProductModel(
      id ?? map.id ?? "",
      map.hashtag ?? "",
      map.hashtags ?? (map.hashtag ? [map.hashtag] : []),
      map.brandId ?? "",
      map.brandName ?? "",
      map.name ?? "",
      map.imageUrl ?? "",
      map.category ?? "",
      map.searchKeywords ?? [],
      map.manualEnabled ?? true,
      map.questionEnabled ?? true,
      map.isActive ?? true,
      toTimestampOrNull(map.createdAt),
      toTimestampOrNull(map.updatedAt)
    );
  }

  toMap(): ProductMap {
    return {
      id: this.id,
      hashtag: this.hashtag,
      hashtags: this.hashtags,
      brandId: this.brandId,
      brandName: this.brandName,
      name: this.name,
      imageUrl: this.imageUrl,
      category: this.category,
      searchKeywords: this.searchKeywords,
      manualEnabled: this.manualEnabled,
      questionEnabled: this.questionEnabled,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  copyWith(data: Partial<ProductMap>): ProductModel {
    return new ProductModel(
      data.id ?? this.id,
      data.hashtag ?? this.hashtag,
      data.hashtags ?? this.hashtags,
      data.brandId ?? this.brandId,
      data.brandName ?? this.brandName,
      data.name ?? this.name,
      data.imageUrl ?? this.imageUrl,
      data.category ?? this.category,
      data.searchKeywords ?? this.searchKeywords,
      data.manualEnabled ?? this.manualEnabled,
      data.questionEnabled ?? this.questionEnabled,
      data.isActive ?? this.isActive,
      data.createdAt ?? this.createdAt,
      data.updatedAt ?? this.updatedAt
    );
  }
}