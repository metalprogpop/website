import { queryOptions, useQuery } from "@tanstack/react-query";
import {
  fanClubVideosResponseSchema,
  videoUrlsSchema,
  type FanClubProgram,
  type VideoUrls,
} from "shared";
import { API_URL } from "../lib/api";

const VIDEOS_URL = `${API_URL}/api/v1/fan-clu/videos`;

const fetchPrograms = async (): Promise<FanClubProgram[]> => {
  const response = await fetch(VIDEOS_URL, { credentials: "include" });
  if (!response.ok) {
    throw new Error("Failed to fetch the Fan Club videos");
  }
  return fanClubVideosResponseSchema.parse(await response.json()).programs;
};

const fetchPartUrls = async (
  program: number,
  part: number,
): Promise<VideoUrls> => {
  const response = await fetch(
    `${VIDEOS_URL}/${String(program)}/${String(part)}/urls`,
    { credentials: "include" },
  );
  if (!response.ok) {
    throw new Error("Failed to sign the video URL");
  }
  return videoUrlsSchema.parse(await response.json());
};

export const fanClubVideosQueryOptions = queryOptions({
  queryKey: ["fan-clu", "videos"],
  queryFn: fetchPrograms,
  staleTime: 5 * 60 * 1000,
});

export function useFanClubVideos() {
  return useQuery(fanClubVideosQueryOptions);
}

// The URLs last 24 hours. A refetch would swap the playing video's source
// and restart it, so they never refresh on their own while in use; they are
// dropped a few minutes after the player goes away, and the player asks for
// a new one when its URL fails.
export function usePartUrls(program: number, part: number, enabled: boolean) {
  return useQuery({
    queryKey: ["fan-clu", "videos", program, part, "urls"],
    queryFn: () => fetchPartUrls(program, part),
    staleTime: Infinity,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled,
  });
}
