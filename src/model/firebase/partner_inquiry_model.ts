import { Timestamp } from "firebase/firestore";
import { FirestoreDate, toTimestampOrNull } from "./firestore_utils";

export type PartnerInquiryStatus =
  | "pending"
  | "received"
  | "in_review"
  | "done"
  | "rejected";

export type PartnerInquiryMap = {
  id: string;
  nameOrCompany: string;
  contact: string;
  title: string;
  content: string;
  status: PartnerInquiryStatus;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
};

export class PartnerInquiryModel {
  constructor(
    public id: string,
    public nameOrCompany: string,
    public contact: string,
    public title: string,
    public content: string,
    public status: PartnerInquiryStatus = "pending",
    public createdAt: Timestamp | null = null,
    public updatedAt: Timestamp | null = null
  ) {}

  static fromMap(
    map: Partial<PartnerInquiryMap> & {
      createdAt?: FirestoreDate;
      updatedAt?: FirestoreDate;
    },
    id?: string
  ): PartnerInquiryModel {
    return new PartnerInquiryModel(
      id ?? map.id ?? "",
      map.nameOrCompany ?? "",
      map.contact ?? "",
      map.title ?? "",
      map.content ?? "",
      (map.status ?? "pending") as PartnerInquiryStatus,
      toTimestampOrNull(map.createdAt),
      toTimestampOrNull(map.updatedAt)
    );
  }

  toMap(): PartnerInquiryMap {
    return {
      id: this.id,
      nameOrCompany: this.nameOrCompany,
      contact: this.contact,
      title: this.title,
      content: this.content,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  copyWith(data: Partial<PartnerInquiryMap>): PartnerInquiryModel {
    return new PartnerInquiryModel(
      data.id ?? this.id,
      data.nameOrCompany ?? this.nameOrCompany,
      data.contact ?? this.contact,
      data.title ?? this.title,
      data.content ?? this.content,
      (data.status ?? this.status) as PartnerInquiryStatus,
      data.createdAt ?? this.createdAt,
      data.updatedAt ?? this.updatedAt
    );
  }
}