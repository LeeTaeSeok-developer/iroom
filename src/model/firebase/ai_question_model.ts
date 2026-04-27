import { Timestamp } from "firebase/firestore";
import { FirestoreDate, toTimestampOrNull } from "./firestore_utils";

export type AIQuestionMap = {
  id: string;
  parentId: string | null;
  question: string;
  answer: string;
  order: number;
  isActive: boolean;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
};

export class AIQuestionModel {
  constructor(
    public id: string,
    public parentId: string | null,
    public question: string,
    public answer: string,
    public order: number = 0,
    public isActive: boolean = true,
    public createdAt: Timestamp | null = null,
    public updatedAt: Timestamp | null = null
  ) {}

  static empty(parentId: string | null = null): AIQuestionModel {
    return new AIQuestionModel("", parentId, "", "", 0, true, null, null);
  }

  static fromMap(
    map: Partial<AIQuestionMap> & {
      createdAt?: FirestoreDate;
      updatedAt?: FirestoreDate;
    },
    id?: string
  ): AIQuestionModel {
    return new AIQuestionModel(
      id ?? map.id ?? "",
      map.parentId ?? null,
      map.question ?? "",
      map.answer ?? "",
      map.order ?? 0,
      map.isActive ?? true,
      toTimestampOrNull(map.createdAt),
      toTimestampOrNull(map.updatedAt)
    );
  }

  toMap(): AIQuestionMap {
    return {
      id: this.id,
      parentId: this.parentId,
      question: this.question,
      answer: this.answer,
      order: this.order,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  copyWith(data: Partial<AIQuestionMap>): AIQuestionModel {
    return new AIQuestionModel(
      data.id ?? this.id,
      data.parentId ?? this.parentId,
      data.question ?? this.question,
      data.answer ?? this.answer,
      data.order ?? this.order,
      data.isActive ?? this.isActive,
      data.createdAt ?? this.createdAt,
      data.updatedAt ?? this.updatedAt
    );
  }
}