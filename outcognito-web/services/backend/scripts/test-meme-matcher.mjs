import {
  findBestMeme,
  resolveMemes,
  getMemeLibrarySize,
} from "../meme-matcher.mjs";


console.log(
  "Meme library size:",
  getMemeLibrarySize()
);


console.log(
  "\n=================================="
);

console.log(
  "SINGLE MEME TEST"
);

console.log(
  "==================================\n"
);


const result =
  findBestMeme({
    memeQuery:
      "facepalm reaction to indecisive behavior",

    character:
      "certified_hater",

    roastability:
      0.94,
  });


console.log(
  JSON.stringify(
    result,
    null,
    2
  )
);


// ============================================================
// FULL THREAD TEST
// ============================================================

console.log(
  "\n=================================="
);

console.log(
  "FULL THREAD TEST"
);

console.log(
  "==================================\n"
);


const testThread = {
  post:
    "Back to the AI in 47 seconds? The sequel nobody asked for.",

  comments: [
    {
      id: "c1",

      character:
        "certified_hater",

      text:
        "Wow, commitment issues level: AI.",

      replyTo:
        null,

      memeQuery:
        "facepalm reaction to indecisive behavior",
    },

    {
      id: "c2",

      character:
        "glazer3000",

      text:
        "They just needed a quick sanity check.",

      replyTo:
        "c1",

      memeQuery:
        null,
    },

    {
      id: "c3",

      character:
        "linkedin_sigma",

      text:
        "A 47-second pivot demonstrates agile adaptability.",

      replyTo:
        null,

      memeQuery:
        "corporate success reaction to aggressive productivity",
    },

    {
      id: "c4",

      character:
        "maincharacter",

      text:
        "The sequel begins after only 47 seconds.",

      replyTo:
        null,

      memeQuery:
        "dramatic cinema reaction to a ridiculous sequel",
    },
  ],
};


const enriched =
  resolveMemes(
    testThread,
    0.94
  );


console.log(
  JSON.stringify(
    enriched,
    null,
    2
  )
);