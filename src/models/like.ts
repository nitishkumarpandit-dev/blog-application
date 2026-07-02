// Copyright 2026 nitishkumarpandit

/**
 * Node Modules
 */
import { Schema, model, Types } from 'mongoose';

export interface ILike {
  blogId?: Types.ObjectId;
  userId: Types.ObjectId;
  commentId?: Types.ObjectId;
}

// Blog Schema
const likeSchema = new Schema<ILike>({
  blogId: {
    type: Schema.Types.ObjectId,
  },
  commentId: {
    type: Schema.Types.ObjectId,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

export default model<ILike>('Like', likeSchema);
