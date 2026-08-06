export type WorkPost = {
  images: string[];
  caption: string;
  likes: string;
  comments: string;
  timestamp: string;
};

// Cover thumbnails + carousel slides for the mobile profile grid, extracted
// from the Meta Ads carousel decks. Fills grid positions 4-9 (bottom two
// rows) in this order.
export const workPosts: WorkPost[] = [
  {
    images: Array.from(
      { length: 6 },
      (_, i) => `/images/work/post-1/0${i + 1}.jpg`
    ),
    caption:
      "Size doesn't matter. Except when it's your brand identity — then it's everything.",
    likes: "1,204",
    comments: "38",
    timestamp: "2 weeks ago",
  },
  {
    images: Array.from(
      { length: 6 },
      (_, i) => `/images/work/post-2/0${i + 1}.jpg`
    ),
    caption:
      "Nobody gives a single f*ck about your product. They care how it makes them feel.",
    likes: "2,981",
    comments: "112",
    timestamp: "3 weeks ago",
  },
  {
    images: Array.from(
      { length: 7 },
      (_, i) => `/images/work/post-3/0${i + 1}.jpg`
    ),
    caption:
      "10 reasons why sleeping on your branding hurts your business just as much.",
    likes: "1,847",
    comments: "64",
    timestamp: "1 month ago",
  },
  {
    images: Array.from(
      { length: 6 },
      (_, i) => `/images/work/post-4/0${i + 1}.jpg`
    ),
    caption: "5 things killing your sales right now — and how to fix them.",
    likes: "956",
    comments: "29",
    timestamp: "1 month ago",
  },
  {
    images: Array.from(
      { length: 5 },
      (_, i) => `/images/work/post-5/0${i + 1}.jpg`
    ),
    caption: "Building a business like a dumbass? We can help with that. 🫏",
    likes: "3,412",
    comments: "201",
    timestamp: "5 weeks ago",
  },
  {
    images: Array.from(
      { length: 6 },
      (_, i) => `/images/work/post-6/0${i + 1}.jpg`
    ),
    caption: "Your logo is killing your business. Here's exactly why.",
    likes: "2,105",
    comments: "77",
    timestamp: "6 weeks ago",
  },
];
