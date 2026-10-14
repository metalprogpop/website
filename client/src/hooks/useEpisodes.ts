import { queryOptions, useQuery } from "@tanstack/react-query";
import {
  episodeDetailSchema,
  episodeListSchema,
  type EpisodeDetail,
  type EpisodeSummary,
} from "shared";
import { API_URL } from "../lib/api";

const EPISODES_URL = `${API_URL}/api/v1/episodes`;

export class EpisodeNotFoundError extends Error {}

async function fetchEpisodes(): Promise<EpisodeSummary[]> {
  const response = await fetch(EPISODES_URL);
  if (!response.ok) {
    throw new Error("Failed to fetch episodes");
  }
  return episodeListSchema.parse(await response.json()).items;
}

async function fetchEpisode(number: number): Promise<EpisodeDetail> {
  const response = await fetch(`${EPISODES_URL}/${String(number)}`);
  if (response.status === 404) {
    throw new EpisodeNotFoundError(`Episode ${String(number)} not found`);
  }
  if (!response.ok) {
    throw new Error("Failed to fetch episode");
  }
  return episodeDetailSchema.parse(await response.json());
}

// Shared by every view that lists episodes, so they hit one cache entry.
export const episodesQueryOptions = queryOptions({
  queryKey: ["episodes"],
  queryFn: fetchEpisodes,
  staleTime: 5 * 60 * 1000,
});

export const episodeQueryOptions = (number: number) =>
  queryOptions({
    queryKey: ["episodes", number],
    queryFn: () => fetchEpisode(number),
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error) =>
      !(error instanceof EpisodeNotFoundError) && failureCount < 3,
  });

export function useEpisodes() {
  return useQuery(episodesQueryOptions);
}

export function useEpisode(number: number) {
  return useQuery(episodeQueryOptions(number));
}
