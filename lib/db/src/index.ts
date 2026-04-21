import mongoose, {
  Schema,
  type InferSchemaType,
  type Model,
  isValidObjectId,
} from "mongoose";

type SerializableRecord = Record<string, unknown> & {
  _id?: { toString(): string };
  __v?: unknown;
};

const schemaOptions = {
  versionKey: false,
  toJSON: { virtuals: true, transform: transformMongoId },
  toObject: { virtuals: true, transform: transformMongoId },
} as const;

const createdAtOptions = {
  ...schemaOptions,
  timestamps: { createdAt: "createdAt", updatedAt: false },
} as const;

function transformMongoId(_document: unknown, returned: SerializableRecord) {
  if (returned._id) {
    returned.id = returned._id.toString();
  }

  delete returned._id;
  delete returned.__v;
  return returned;
}

let connectionPromise: Promise<typeof mongoose> | null = null;

export async function connectDatabase(): Promise<typeof mongoose> {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.warn(
      "[db] DATABASE_URL is not set. Set DATABASE_URL to your MongoDB connection string before starting the API.",
    );
    process.exit(0);
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  connectionPromise ??= mongoose.connect(databaseUrl);
  return connectionPromise;
}

export { mongoose, isValidObjectId };

const menuItemSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    emoji: { type: String, required: true, default: "🍪" },
    category: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    cost: { type: Number, required: true, min: 0 },
    description: { type: String, default: null },
    available: { type: Boolean, required: true, default: true },
  },
  createdAtOptions,
);

const customerSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, default: null },
    email: { type: String, default: null },
    address: { type: String, default: null },
    totalOrders: { type: Number, required: true, default: 0, min: 0 },
    totalSpent: { type: Number, required: true, default: 0, min: 0 },
    notes: { type: String, default: null },
  },
  createdAtOptions,
);

const orderItemSchema = new Schema(
  {
    menuItemId: { type: String, default: null },
    name: { type: String, required: true },
    emoji: { type: String, required: true },
    qty: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const orderSchema = new Schema(
  {
    customerId: { type: String, default: null },
    customerName: { type: String, required: true, trim: true },
    date: { type: Date, required: true, default: Date.now },
    items: { type: [orderItemSchema], required: true, default: [] },
    discount: { type: Number, required: true, default: 0, min: 0 },
    deliveryCharge: { type: Number, required: true, default: 0, min: 0 },
    status: {
      type: String,
      required: true,
      enum: ["pending", "ready", "delivered", "cancelled"],
      default: "pending",
    },
    notes: { type: String, default: null },
    invoiceNumber: { type: String, required: true, unique: true },
  },
  createdAtOptions,
);

const ingredientSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    unit: { type: String, required: true, trim: true },
    stock: { type: Number, required: true, default: 0, min: 0 },
    costPerUnit: { type: Number, required: true, min: 0 },
    minStock: { type: Number, required: true, default: 0, min: 0 },
  },
  createdAtOptions,
);

const recipeIngredientSchema = new Schema(
  {
    ingredientId: { type: String, required: true },
    ingredientName: { type: String, required: true },
    quantity: { type: Number, required: true, min: 0 },
    unit: { type: String, required: true },
  },
  { _id: false },
);

const recipeSchema = new Schema(
  {
    menuItemId: { type: String, default: null },
    menuItemName: { type: String, required: true, trim: true },
    ingredients: { type: [recipeIngredientSchema], required: true, default: [] },
    instructions: { type: String, default: null },
    servings: { type: Number, required: true, default: 1, min: 1 },
  },
  createdAtOptions,
);

const reviewSchema = new Schema(
  {
    customerName: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    product: { type: String, default: null },
    approved: { type: Boolean, required: true, default: false },
  },
  createdAtOptions,
);

const settingsSchema = new Schema(
  {
    bakeryName: { type: String, required: true, default: "orDough" },
    tagline: { type: String, required: true, default: "one more?" },
    phone: { type: String, default: null },
    address: { type: String, default: null },
    upiId: { type: String, default: "ordough@ybl" },
    whatsapp: { type: String, default: null },
    currency: { type: String, required: true, default: "₹" },
    taxRate: { type: Number, required: true, default: 0, min: 0 },
  },
  {
    ...schemaOptions,
    timestamps: { createdAt: false, updatedAt: "updatedAt" },
  },
);

export type MenuItemDocument = InferSchemaType<typeof menuItemSchema>;
export type CustomerDocument = InferSchemaType<typeof customerSchema>;
export type OrderDocument = InferSchemaType<typeof orderSchema>;
export type IngredientDocument = InferSchemaType<typeof ingredientSchema>;
export type RecipeDocument = InferSchemaType<typeof recipeSchema>;
export type ReviewDocument = InferSchemaType<typeof reviewSchema>;
export type SettingsDocument = InferSchemaType<typeof settingsSchema>;

export const MenuItem =
  (mongoose.models.MenuItem as Model<MenuItemDocument> | undefined) ??
  mongoose.model<MenuItemDocument>("MenuItem", menuItemSchema, "menu_items");

export const Customer =
  (mongoose.models.Customer as Model<CustomerDocument> | undefined) ??
  mongoose.model<CustomerDocument>("Customer", customerSchema, "customers");

export const Order =
  (mongoose.models.Order as Model<OrderDocument> | undefined) ??
  mongoose.model<OrderDocument>("Order", orderSchema, "orders");

export const Ingredient =
  (mongoose.models.Ingredient as Model<IngredientDocument> | undefined) ??
  mongoose.model<IngredientDocument>("Ingredient", ingredientSchema, "ingredients");

export const Recipe =
  (mongoose.models.Recipe as Model<RecipeDocument> | undefined) ??
  mongoose.model<RecipeDocument>("Recipe", recipeSchema, "recipes");

export const Review =
  (mongoose.models.Review as Model<ReviewDocument> | undefined) ??
  mongoose.model<ReviewDocument>("Review", reviewSchema, "reviews");

export const Settings =
  (mongoose.models.Settings as Model<SettingsDocument> | undefined) ??
  mongoose.model<SettingsDocument>("Settings", settingsSchema, "settings");
