import { model, Schema } from 'mongoose';
import { Food } from '../entities/food.js';

const foodSchema = new Schema<Food>({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  cuisine: {
    type: String,
  },
  diet: {
    type: String,
  },
  region: {
    type: String,
  },
  info: {
    type: String,
  },

  img: {
    type: String,
  },
});
foodSchema.set('toJSON', {
  transform(_document, returnedObject) {
    returnedObject.id = returnedObject._id;
    delete returnedObject.__v;
    delete returnedObject._id;
  },
});
export const FoodModel = model('Food', foodSchema, 'foods');
