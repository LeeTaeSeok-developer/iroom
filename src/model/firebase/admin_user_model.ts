import { Timestamp } from "firebase/firestore";
import { FirestoreDate, toTimestampOrNull } from "./firestore_utils";

export type AdminUserMap = {
  id: string;
  email: string;
  role: string;
  createdAt: Timestamp | null;
};

export class AdminUserModel {
  constructor(
    public id: string,
    public email: string,
    public role: string = "admin",
    public createdAt: Timestamp | null = null
  ) {}

  static fromMap(
    map: Partial<AdminUserMap> & {
      createdAt?: FirestoreDate;
    },
    id?: string
  ): AdminUserModel {
    return new AdminUserModel(
      id ?? map.id ?? "",
      map.email ?? "",
      map.role ?? "admin",
      toTimestampOrNull(map.createdAt)
    );
  }

  toMap(): AdminUserMap {
    return {
      id: this.id,
      email: this.email,
      role: this.role,
      createdAt: this.createdAt,
    };
  }

  copyWith(data: Partial<AdminUserMap>): AdminUserModel {
    return new AdminUserModel(
      data.id ?? this.id,
      data.email ?? this.email,
      data.role ?? this.role,
      data.createdAt ?? this.createdAt
    );
  }
}