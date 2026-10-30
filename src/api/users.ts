import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, unwrap } from "./client";
import type { ApiResponse, SubscriptionHistoryItem, User, UserUpdate, WatchHistoryPage } from "@/types/api";

export const userKeys = {
  all: ["users"] as const,
  detail: (id: string) => ["users", id] as const,
  watchHistory: (id: string, page: number) => ["users", id, "watch-history", page] as const,
  subscriptionHistory: (id: string) => ["users", id, "subscription-history"] as const,
};

export const WATCH_HISTORY_PAGE_SIZE = 10;

/** GET /admin/users returns every user (no paging); search and filter happen client-side. */
export function useUsers() {
  return useQuery({
    queryKey: userKeys.all,
    queryFn: () => unwrap(api.get<ApiResponse<User[]>>("/admin/users")),
    staleTime: 60_000,
  });
}

export function useUser(id: string) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => unwrap(api.get<ApiResponse<User>>(`/admin/user/${id}`)),
    // Show the row from the list instantly while the detail loads.
    placeholderData: () => queryClient.getQueryData<User[]>(userKeys.all)?.find((u) => u._id === id),
    enabled: Boolean(id),
  });
}

export function useUserWatchHistory(id: string, page: number) {
  return useQuery({
    queryKey: userKeys.watchHistory(id, page),
    queryFn: () =>
      unwrap(
        api.get<ApiResponse<WatchHistoryPage>>(`/admin/user/${id}/watch-history`, {
          params: { page, limit: WATCH_HISTORY_PAGE_SIZE },
        }),
      ),
    // Keep the current rows on screen while the next page loads.
    placeholderData: keepPreviousData,
    enabled: Boolean(id),
  });
}

export function useUserSubscriptionHistory(id: string) {
  return useQuery({
    queryKey: userKeys.subscriptionHistory(id),
    queryFn: () => unwrap(api.get<ApiResponse<SubscriptionHistoryItem[]>>(`/admin/user/${id}/subscription-history`)),
    enabled: Boolean(id),
  });
}

// PUT /admin/user/:id writes the body straight to the document, so only ever send
// this allowlist. Never send `password`: it would be stored unhashed.
const EDITABLE: (keyof UserUpdate)[] = [
  "plan",
  "subscriptionStatus",
  "subscriptionPlatform",
  "subscriptionProductId",
  "subscriptionStartDate",
  "subscriptionExpiresAt",
];

export function useUpdateUser(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (changes: UserUpdate) => {
      const body = Object.fromEntries(EDITABLE.filter((k) => changes[k] !== undefined).map((k) => [k, changes[k]]));
      await api.put(`/admin/user/${id}`, body);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: userKeys.all }),
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/user/${id}`);
      return id;
    },
    onSuccess: (id) => {
      queryClient.removeQueries({ queryKey: userKeys.detail(id) });
      queryClient.setQueryData<User[]>(userKeys.all, (users) => users?.filter((u) => u._id !== id));
      return queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}
