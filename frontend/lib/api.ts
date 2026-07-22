const API_URL = "http://localhost:8080/api";

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  // If running in the browser, forward the acting branch id from localStorage
  const branchHeader: Record<string,string> = {};
  try {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem("restroaudit.currentUser");
      const current = raw ? JSON.parse(raw) : null;
      if (current && current.branchId) branchHeader["X-Branch-Id"] = String(current.branchId);
    }
  } catch (e) {}

  const res = await fetch(`${API_URL}${path}`, {
    cache: "no-store",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
      ...branchHeader,
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const err = new Error(text || `Request failed (${res.status})`);
    try { (err as any).status = res.status; (err as any).body = text; } catch(e) {}
    throw err;
  }

  return (await res.json()) as T;
}

export const fetchDepartments = async () => {
  return requestJson<any[]>("/departments");
};

export const fetchBranches = async () => {
  return requestJson<any[]>("/branches");
};

export const createBranch = async (branchData: any) => {
  return requestJson<any>("/branches", {
    method: "POST",
    body: JSON.stringify(branchData),
  });
};

export const fetchUsers = async () => {
  return requestJson<any[]>("/users");
};

export const fetchIngredients = async () => {
  return requestJson<any[]>("/ingredients");
};

export const createIngredient = async (ingData: any) => {
  return requestJson<any>("/ingredients", {
    method: "POST",
    body: JSON.stringify(ingData),
  });
};

export const updateIngredient = async (ingId: number, ingData: any) => {
  return requestJson<any>(`/ingredients/${encodeURIComponent(ingId)}`, {
    method: "PUT",
    body: JSON.stringify(ingData),
  });
};

export const fetchMenuItems = async () => {
  return requestJson<any[]>("/menu-items");
};

export const fetchOrders = async () => {
  return requestJson<any[]>("/orders");
};

export const fetchOrdersByBranch = async (branchId: number) => {
  return requestJson<any[]>(`/orders/by-branch/${encodeURIComponent(branchId)}`);
};

export const updateOrder = async (orderId: number, orderData: any) => {
  return requestJson<any>(`/orders/${encodeURIComponent(orderId)}`, {
    method: "PUT",
    body: JSON.stringify(orderData),
  });
};

export const fetchAuditLogs = async (limit: number = 100) => {
  return requestJson<any[]>(`/audit-logs?limit=${encodeURIComponent(limit)}`);
};

export const fetchOrdersByUser = async (userId: number) => {
  return requestJson<any[]>(`/orders/by-user/${encodeURIComponent(userId)}`);
};

export const fetchFeedback = async () => {
  return requestJson<any[]>("/feedbacks");
};

export const fetchComplaintLogs = async () => {
  return requestJson<any[]>("/complaint-logs");
};

export const createComplaintLog = async (complaintData: any) => {
  return requestJson<any>("/complaint-logs", {
    method: "POST",
    body: JSON.stringify(complaintData),
  });
};

export const updateComplaintLog = async (logId: number, complaintData: any) => {
  return requestJson<any>(`/complaint-logs/${encodeURIComponent(logId)}`, {
    method: "PUT",
    body: JSON.stringify(complaintData),
  });
};

export const createFeedback = async (feedbackData: any) => {
  const ratingScore = feedbackData?.ratingScore;
  const textComments = feedbackData?.textComments;
  const userId = feedbackData?.userId;
  const branchId = feedbackData?.branchId || 101; // Assigning default branch for fallback if it's missing in payload
  const itemId = feedbackData?.itemId;
  const orderId = feedbackData?.orderId;

  const payload = {
    ratingScore,
    textComments,
    user: userId ? { userId } : undefined,
    branch: branchId ? { branchId } : undefined,
    menuItem: itemId ? { itemId } : undefined,
    orderId: orderId,
  };

  return requestJson<any>("/feedbacks", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const registerUser = async (userData: any) => {
  return requestJson<any>("/users", {
    method: "POST",
    body: JSON.stringify(userData),
  });
};

export const fetchUserById = async (userId: number) => {
  return requestJson<any>(`/users/${encodeURIComponent(userId)}`);
};

export const createOrder = async (orderData: any) => {
  return requestJson<any>("/orders", {
    method: "POST",
    body: JSON.stringify(orderData),
  });
};

export const deleteMenuItem = async (itemId: number) => {
  const res = await fetch(`${API_URL}/menu-items/${encodeURIComponent(itemId)}`, {
    method: "DELETE",
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Delete failed (${res.status})`);
};
