import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, unwrap } from "./client";
import type { Announcement, AnnouncementInput, ApiResponse } from "@/types/api";

export const announcementKeys = { all: ["announcements"] as const };

export function useAnnouncements() {
  return useQuery({
    queryKey: announcementKeys.all,
    queryFn: () => unwrap(api.get<ApiResponse<Announcement[]>>("/announcement/admin")),
  });
}

export function useSaveAnnouncement(id?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<AnnouncementInput>) =>
      unwrap(
        id
          ? api.put<ApiResponse<Announcement>>(`/announcement/admin/${id}`, input)
          : api.post<ApiResponse<Announcement>>("/announcement/admin", input),
      ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: announcementKeys.all }),
  });
}

export function useDeleteAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/announcement/admin/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: announcementKeys.all }),
  });
}

export type AnnouncementState = "active" | "scheduled" | "expired" | "inactive";

export function announcementState(a: Announcement, now = new Date()): AnnouncementState {
  if (!a.isActive) return "inactive";
  if (a.startsAt && new Date(a.startsAt) > now) return "scheduled";
  if (a.endsAt && new Date(a.endsAt) < now) return "expired";
  return "active";
}
