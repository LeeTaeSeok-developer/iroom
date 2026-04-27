export type StoreLinkMap = {
  id: string;
  name: string;
  url: string;
  order: number;
  isActive: boolean;
};

export class StoreLinkModel {
  constructor(
    public id: string,
    public name: string,
    public url: string,
    public order: number = 0,
    public isActive: boolean = true
  ) {}

  static fromMap(map: Partial<StoreLinkMap>, id?: string): StoreLinkModel {
    return new StoreLinkModel(
      id ?? map.id ?? "",
      map.name ?? "",
      map.url ?? "",
      map.order ?? 0,
      map.isActive ?? true
    );
  }

  toMap(): StoreLinkMap {
    return {
      id: this.id,
      name: this.name,
      url: this.url,
      order: this.order,
      isActive: this.isActive,
    };
  }

  copyWith(data: Partial<StoreLinkMap>): StoreLinkModel {
    return new StoreLinkModel(
      data.id ?? this.id,
      data.name ?? this.name,
      data.url ?? this.url,
      data.order ?? this.order,
      data.isActive ?? this.isActive
    );
  }
}