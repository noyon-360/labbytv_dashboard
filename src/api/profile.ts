import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, unwrap } from "./client";
import type { ApiResponse, User } from "@/types/api";

export const profileKey = ["profile"] as const;

export const fetchProfile = () => unwrap(api.get<ApiResponse<User>>("/user/profile"));

export function useProfile() {
  return useQuery({ queryKey: profileKey, queryFn: fetchProfile, staleTime: 5 * 60_000 });
}

export type ProfileUpdate = { name: string; avatar?: File | null };

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, avatar }: ProfileUpdate) => {
      const form = new FormData();
      form.append("name", name);
      if (avatar) form.append("avatar", avatar);
      await api.put("/user/profile", form);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: profileKey }),
  });
}
