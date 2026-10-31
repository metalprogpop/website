import { useQuery } from "@tanstack/react-query";
import {
  poneRecListSchema,
  poneRecUrlPath,
  poneRecUrlSchema,
  type PoneRec,
} from "shared";
import { API_URL } from "../lib/api";

const fetchPoneRecs = async (): Promise<PoneRec[]> => {
  const response = await fetch(`${API_URL}/api/v1/fan-clu/pone-rec`, {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch Poné Rec");
  }
  return poneRecListSchema.parse(await response.json()).episodes;
};

// Members only: pass enabled = false until access is known.
export function usePoneRecs({ enabled = true } = {}) {
  return useQuery({
    queryKey: ["fan-clu", "pone-rec"],
    queryFn: fetchPoneRecs,
    staleTime: 5 * 60 * 1000,
    enabled,
  });
}

// Signed on demand, right before playing; the player renews it if it
// expires mid-listen.
export const fetchPoneRecUrl = async (program: number): Promise<string> => {
  const response = await fetch(`${API_URL}${poneRecUrlPath(program)}`, {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to sign the Poné Rec URL");
  }
  return poneRecUrlSchema.parse(await response.json()).url;
};
