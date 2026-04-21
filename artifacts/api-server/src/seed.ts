import {
  MenuItem,
  Review,
  Settings,
  connectDatabase,
  mongoose,
} from "@workspace/db";

const menuItems = [
  {
    name: "Classic Choco Chip Cookie",
    emoji: "🍪",
    category: "Cookies",
    price: 90,
    cost: 38,
    description: "Brown butter cookie loaded with dark chocolate chunks.",
    available: true,
  },
  {
    name: "Red Velvet Cupcake",
    emoji: "🧁",
    category: "Cupcakes",
    price: 130,
    cost: 56,
    description: "Cocoa sponge with cream cheese frosting.",
    available: true,
  },
  {
    name: "Fudge Brownie Slab",
    emoji: "🍫",
    category: "Brownies",
    price: 160,
    cost: 72,
    description: "Dense Belgian chocolate brownie with crackly tops.",
    available: true,
  },
  {
    name: "Cinnamon Roll",
    emoji: "🥐",
    category: "Pastry",
    price: 150,
    cost: 64,
    description: "Soft swirls with cinnamon sugar and vanilla glaze.",
    available: true,
  },
  {
    name: "Mini Doughnut Box",
    emoji: "🍩",
    category: "Doughnuts",
    price: 240,
    cost: 108,
    description: "Six bite-sized doughnuts with assorted toppings.",
    available: true,
  },
  {
    name: "Strawberry Bento Cake",
    emoji: "🍰",
    category: "Cakes",
    price: 480,
    cost: 220,
    description: "A tiny celebration cake with strawberry buttercream.",
    available: true,
  },
];

const reviews = [
  {
    customerName: "Aarohi",
    rating: 5,
    comment: "The brownie slab was rich, fudgy, and absolutely worth ordering again.",
    product: "Fudge Brownie Slab",
    approved: true,
  },
  {
    customerName: "Kabir",
    rating: 5,
    comment: "Cupcakes arrived fresh and the frosting was perfect.",
    product: "Red Velvet Cupcake",
    approved: true,
  },
  {
    customerName: "Mira",
    rating: 4,
    comment: "The cookie box disappeared in ten minutes at our movie night.",
    product: "Classic Choco Chip Cookie",
    approved: true,
  },
];

await connectDatabase();

await Promise.all([
  MenuItem.deleteMany({}),
  Review.deleteMany({}),
  Settings.deleteMany({}),
]);

await MenuItem.create(menuItems);
await Review.create(reviews);
await Settings.create({
  bakeryName: "orDough",
  tagline: "one more?",
  upiId: "ordough@ybl",
  currency: "₹",
  taxRate: 0,
});

console.log("Seeded orDough sample data.");
await mongoose.disconnect();
