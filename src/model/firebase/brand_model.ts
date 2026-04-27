//브랜드 정보 관리

export type BrandMap = {
  id: string; //브랜드 아이디
  name: string; //브랜드 이름
  imageUrl: string; //브랜드 로고 이미지
  priority: number; //정렬 순서
  isActive: boolean;  //사용 여부
};

export class BrandModel {
  constructor(
    public id: string,
    public name: string,
    public imageUrl: string,
    public priority: number = 0,
    public isActive: boolean = true
  ) {}

  static empty(): BrandModel {
    return new BrandModel("", "", "", 0, true);
  }

  static fromMap(map: Partial<BrandMap>, id?: string): BrandModel {
    return new BrandModel(
      id ?? map.id ?? "",
      map.name ?? "",
      map.imageUrl ?? "",
      map.priority ?? 0,
      map.isActive ?? true
    );
  }

  toMap(): BrandMap {
    return {
      id: this.id,
      name: this.name,
      imageUrl: this.imageUrl,
      priority: this.priority,
      isActive: this.isActive,
    };
  }

  copyWith(data: Partial<BrandMap>): BrandModel {
    return new BrandModel(
      data.id ?? this.id,
      data.name ?? this.name,
      data.imageUrl ?? this.imageUrl,
      data.priority ?? this.priority,
      data.isActive ?? this.isActive
    );
  }
}