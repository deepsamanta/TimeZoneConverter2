import { useQuery } from "@tanstack/react-query";
import { Timezone } from "@/utils/timezone";

export function useTimezones() {
  return useQuery<Timezone[]>({
    queryKey: ['/api/timezones'],
    staleTime: Infinity, // Timezones won't change during app usage
  });
}
