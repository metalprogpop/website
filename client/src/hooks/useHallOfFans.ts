import { useQuery } from "@tanstack/react-query";
import { hallOfFansResponseSchema } from "shared";
import { API_URL } from "../lib/api";

const fetchHallOfFans = async (): Promise<string[]> => {
  const res = await fetch(`${API_URL}/api/v1/fan-clu/hall-of-fans`);
  if (!res.ok) {
    throw new Error("Failed to fetch the Hall of Fans");
  }
  return hallOfFansResponseSchema.parse(await res.json()).names;
};

export const useHallOfFans = () =>
  useQuery({
    queryKey: ["fan-clu", "hall-of-fans"],
    queryFn: fetchHallOfFans,
    staleTime: 5 * 60 * 1000,
  });
