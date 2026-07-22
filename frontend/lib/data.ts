// MOCK DATA — replace exports with API fetch calls when connecting to MySQL backend

export type Department = { dept_id: number; dept_name: string };
export type Branch = {
  branch_id: number;
  phone_no: string;
  street_no: string;
  pin_code: string;
  address_line: string;
};
export type User = {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_no: string;
  user_role: "Admin" | "Manager" | "Staff" | "Customer";
  branch_id: number;
  dept_id: number | null;
};
export type CustomerProfile = {
  profile_id: number;
  user_id: number;
  loyalty_points: number;
  favorite_cuisine: string;
};
export type Ingredient = {
  ing_id: number;
  ing_name: string;
  stock_quantity: number;
  expiry_date: string;
};
export type MenuItem = {
  item_id: number;
  item_name: string;
  price: number;
  category: string;
};
export type Recipe = {
  item_id: number;
  ing_id: number;
  quantity_required: number;
};
export type Order = {
  order_id: number;
  order_time: string;
  user_id: number;
  branch_id: number;
};
export type OrderDetail = {
  order_id: number;
  item_id: number;
  quantity: number;
  subtotal: number;
};
export type Payment = {
  payment_id: number;
  order_id: number;
  amount: number;
  payment_mode: string;
  payment_date: string;
};
export type Feedback = {
  feedback_id: number;
  rating_score: number;
  text_comments: string;
  user_id: number;
  branch_id: number;
  item_id: number;
};
export type ComplaintLog = {
  log_id: number;
  status: "Open" | "In Progress" | "Resolved";
  resolution_notes: string;
  feedback_id: number;
};

export const DEPARTMENTS: Department[] = [
  { dept_id: 1, dept_name: "Kitchen" },
  { dept_id: 2, dept_name: "Service" },
  { dept_id: 3, dept_name: "Management" },
];

export const BRANCHES: Branch[] = [
  { branch_id: 101, phone_no: "9876543210", street_no: "No. 12", pin_code: "600001", address_line: "Chennai-Main" },
  { branch_id: 102, phone_no: "9876543211", street_no: "No. 45", pin_code: "600002", address_line: "Chennai-T.Nagar" },
];

export const USERS: User[] = [
  { user_id: 1001, first_name: "Nikhil", last_name: "Karur", email: "karurnikhil@mail.com", phone_no: "9030620314", user_role: "Admin", branch_id: 101, dept_id: 3 },
  { user_id: 1002, first_name: "Rahul", last_name: "Verma", email: "rahul@gmail.com", phone_no: "9000033333", user_role: "Customer", branch_id: 101, dept_id: null },
  { user_id: 1003, first_name: "Sai Sujan", last_name: "Balaji", email: "saisujan@mail.com", phone_no: "9123456780", user_role: "Manager", branch_id: 101, dept_id: 3 },
  { user_id: 1004, first_name: "Priya", last_name: "Sharma", email: "priya@mail.com", phone_no: "9876543212", user_role: "Staff", branch_id: 101, dept_id: 2 },
];

export const CUSTOMER_PROFILES: CustomerProfile[] = [];

export const INGREDIENTS: Ingredient[] = [
  { ing_id: 1, ing_name: "Burger Bun", stock_quantity: 150.0, expiry_date: "2026-05-10" },
  { ing_id: 2, ing_name: "Cheese Slice", stock_quantity: 80.0, expiry_date: "2026-06-01" },
  { ing_id: 3, ing_name: "Potato", stock_quantity: 300.0, expiry_date: "2026-05-20" },
];

export const MENU_ITEMS: MenuItem[] = [
  { item_id: 1, item_name: "Classic Burger", price: 250.0, category: "Main Course" },
  { item_id: 2, item_name: "Cheese Fries", price: 120.0, category: "Starter" },
  { item_id: 3, item_name: "Margherita Pizza", price: 350.0, category: "Main Course" },
];

export const RECIPES: Recipe[] = [];

export const ORDERS: Order[] = [
  { order_id: 5001, order_time: "2026-05-01T14:30:00", user_id: 1002, branch_id: 101 },
  { order_id: 5002, order_time: "2026-04-28T12:15:00", user_id: 1002, branch_id: 101 },
];

export const ORDER_DETAILS: OrderDetail[] = [
  { order_id: 5001, item_id: 1, quantity: 2, subtotal: 500.0 },
  { order_id: 5001, item_id: 2, quantity: 1, subtotal: 120.0 },
];

export const PAYMENTS: Payment[] = [];

export const FEEDBACK: Feedback[] = [
  { feedback_id: 1, rating_score: 2, text_comments: "Fries were salty and cold.", user_id: 1002, branch_id: 101, item_id: 2 },
  { feedback_id: 2, rating_score: 5, text_comments: "Burger was perfectly cooked and juicy!", user_id: 1002, branch_id: 101, item_id: 1 },
];

export const COMPLAINT_LOGS: ComplaintLog[] = [
  { log_id: 1, status: "Open", resolution_notes: "Chef notified to reduce salt..", feedback_id: 1 },
];

// Helper functions
export function getUserById(userId: number): User | undefined {
  return USERS.find((u) => u.user_id === userId);
}

export function getMenuItemById(itemId: number): MenuItem | undefined {
  return MENU_ITEMS.find((m) => m.item_id === itemId);
}

export function getIngredientById(ingId: number): Ingredient | undefined {
  return INGREDIENTS.find((i) => i.ing_id === ingId);
}

export function getRecipeForItem(itemId: number): Recipe[] {
  return RECIPES.filter((r) => r.item_id === itemId);
}

export function getOrderDetailsForOrder(orderId: number): OrderDetail[] {
  return ORDER_DETAILS.filter((od) => od.order_id === orderId);
}

export function getFeedbackForItem(itemId: number): Feedback[] {
  return FEEDBACK.filter((f) => f.item_id === itemId);
}

export function getComplaintForFeedback(feedbackId: number): ComplaintLog | undefined {
  return COMPLAINT_LOGS.find((c) => c.feedback_id === feedbackId);
}

export function calculateAverageRating(): number {
  if (FEEDBACK.length === 0) return 0;
  const sum = FEEDBACK.reduce((acc, f) => acc + f.rating_score, 0);
  return Math.round((sum / FEEDBACK.length) * 10) / 10;
}

export function getLowStockIngredients(threshold: number = 50): Ingredient[] {
  return INGREDIENTS.filter((i) => i.stock_quantity < threshold);
}

export function getActiveComplaints(): ComplaintLog[] {
  return COMPLAINT_LOGS.filter((c) => c.status !== "Resolved");
}

export function formatCurrency(amount: number): string {
  return `₹${amount.toFixed(2)}`;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function calculateOrderTotal(order: any): number {
  if (!order) return 0;

  const details = Array.isArray(order.orderDetails) ? order.orderDetails : [];
  if (details.length > 0) {
    return details.reduce((sum: number, d: any) => {
      const subtotal = Number(d?.subtotal ?? 0);
      return sum + (Number.isFinite(subtotal) ? subtotal : 0);
    }, 0);
  }

  const fallback = Number(order?.totalAmount ?? 0);
  return Number.isFinite(fallback) ? fallback : 0;
}
