//정책 관리 (A/S, 반품)

export type PolicyType = "as" | "return" | "caution" | "warranty";

export type PolicyMap = {
  id: string;
  type: PolicyType;
  title: string;
  content: string;
  isActive: boolean;
};

export class PolicyModel {
  constructor(
    public id: string,
    public type: PolicyType,
    public title: string,
    public content: string,
    public isActive: boolean = true
  ) {}

  static fromMap(map: Partial<PolicyMap>, id?: string): PolicyModel {
    return new PolicyModel(
      id ?? map.id ?? "",
      (map.type ?? "as") as PolicyType,
      map.title ?? "",
      map.content ?? "",
      map.isActive ?? true
    );
  }

  toMap(): PolicyMap {
    return {
      id: this.id,
      type: this.type,
      title: this.title,
      content: this.content,
      isActive: this.isActive,
    };
  }

  copyWith(data: Partial<PolicyMap>): PolicyModel {
    return new PolicyModel(
      data.id ?? this.id,
      (data.type ?? this.type) as PolicyType,
      data.title ?? this.title,
      data.content ?? this.content,
      data.isActive ?? this.isActive
    );
  }
}