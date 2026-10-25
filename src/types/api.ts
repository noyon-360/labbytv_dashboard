export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type ApiErrorBody = {
  success: false;
  message: string;
  errorSources?: { path: string; message: string }[];
};

export type Plan = "free" | "basic" | "premium";
export type SubscriptionStatus = "none" | "active" | "canceled" | "past_due" | "trialing";
export type SubscriptionPlatform = "none" | "apple" | "google";
export type DevicePlatform = "android" | "ios" | "macos" | "web";

export type User = {
  _id: string;
  name?: string;
  email: string;
  phone?: string;
  country?: string;
  city?: string;
  avatar?: { public_id?: string; url?: string };
  role: "user" | "admin";
  plan: Plan;
  subscriptionStatus: SubscriptionStatus;
  subscriptionPlatform: SubscriptionPlatform;
  subscriptionProductId?: string;
  subscriptionStartDate?: string | null;
  subscriptionExpiresAt?: string | null;
  fcmTokens?: { deviceId: string; platform: DevicePlatform; updatedAt?: string }[];
  createdAt: string;
  updatedAt: string;
};

/** The only fields the dashboard ever sends to PUT /admin/user/:id. */
export type UserUpdate = Partial<Pick<User, "plan" | "subscriptionStatus">>;

export type AnnouncementType = "update" | "feature" | "maintenance" | "important" | "info";

export type Announcement = {
  _id: string;
  title: string;
  message: string;
  type: AnnouncementType;
  actionLabel?: string;
  actionUrl?: string;
  priority: number;
  isActive: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AnnouncementInput = {
  title: string;
  message: string;
  type: AnnouncementType;
  actionLabel: string;
  actionUrl: string;
  priority: number;
  isActive: boolean;
  startsAt: string | null;
  endsAt: string | null;
};

export type LoginResult = {
  accessToken: string;
  refreshToken: string;
  role: User["role"];
  _id: string;
};

export type TokenPair = { accessToken: string; refreshToken: string };
