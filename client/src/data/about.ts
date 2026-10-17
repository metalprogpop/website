import guidoPhoto from "../assets/images/about/guido.jpg";
import angelPhoto from "../assets/images/about/angel.jpg";
import gonzaloPhoto from "../assets/images/about/gonzalo.jpg";
import santiPhoto from "../assets/images/about/santi.jpg";

export type Member = {
  name: string;
  nickname: string;
  // What each of us brings to the show: the three genres, plus the Cast.
  role: "Metal" | "Prog" | "Pop" | "Cast";
  focus: string;
  instagram: string;
  photo: string;
};

export const members: Member[] = [
  {
    name: "Guido Vilariño",
    nickname: "El Rey Tut",
    role: "Metal",
    focus: "Metal y rock pesado",
    instagram: "gvilarino",
    photo: guidoPhoto,
  },
  {
    name: "Angel Appiani",
    nickname: "Dr. Ángel",
    role: "Prog",
    focus: "Rock progresivo",
    instagram: "drangelus",
    photo: angelPhoto,
  },
  {
    name: "Gonzalo Ares",
    nickname: "El Colo",
    role: "Pop",
    focus: "Pop y pop rock",
    instagram: "gonzalo.julian.ares",
    photo: gonzaloPhoto,
  },
  {
    name: "Santiago Grillo",
    nickname: "Santi",
    role: "Cast",
    focus: "Imagen y magia",
    instagram: "san_grillo",
    photo: santiPhoto,
  },
];

export const instagramUrl = (handle: string) =>
  `https://www.instagram.com/${handle}/`;

export type Video = {
  youtubeId: string;
  title: string;
  // Which of us play on it, from the video's credits.
  players: string;
  // Upload year on YouTube.
  year: number;
};

export const lecheenpolvoChannel = "https://www.youtube.com/@lecheenpolvo";

// A fixed selection from the Lecheenpolvo & Friends channel: covers where at
// least two of us play, newest first. Edit this list by hand.
export const videos: Video[] = [
  {
    youtubeId: "1G4Af0_zYM0",
    title: "Du Hast",
    players: "Angel en voz, Santi en teclados",
    year: 2023,
  },
  {
    youtubeId: "mirBuhq2iU4",
    title: "Highway Star",
    players: "Guido en voz, Angel en teclados",
    year: 2022,
  },
  {
    youtubeId: "zshMLW9jh8c",
    title:
      "Unquiet Slumbers For The Sleepers / In That Quiet Earth / Afterglow",
    players: "Gonzalo en guitarra, Angel en teclados",
    year: 2022,
  },
  {
    youtubeId: "l4-UuwrLTQg",
    title: "Bargain",
    players: "Guido en voz, Gonzalo en guitarra, Angel en teclados",
    year: 2021,
  },
  {
    youtubeId: "IN8hAPSdrtU",
    title: "Pinball Wizard",
    players: "Guido en voz, Gonzalo en guitarra, Angel en teclados",
    year: 2021,
  },
  {
    youtubeId: "5MhOcxusFQ8",
    title: "White Rabbit",
    players: "Santi en batería, Gonzalo y Angel en guitarras",
    year: 2021,
  },
  {
    youtubeId: "YtJvwVFwz4Y",
    title: "Sparks",
    players: "Santi en batería, Angel en guitarra",
    year: 2021,
  },
  {
    youtubeId: "xHOj0lg5o5g",
    title: "Boris The Spider",
    players: "Angel en voz y guitarra, Guido y Gonzalo en coros",
    year: 2020,
  },
  {
    youtubeId: "g_MIIhaPBz0",
    title: "Living Loving Maid",
    players: "Guido en voz, Santi en batería, Angel en guitarra",
    year: 2017,
  },
];

export type Appearance = {
  title: string;
  outlet: string;
  url: string;
  year: number;
};

// Interviews and guest spots on other shows. The section stays hidden while
// the list is empty.
export const appearances: Appearance[] = [];
