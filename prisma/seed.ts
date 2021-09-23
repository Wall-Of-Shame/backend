import {
  AvatarAnimal,
  AvatarColor,
  ChallengeType,
  PrismaClient,
} from "@prisma/client";

const prisma = new PrismaClient();

const seedEmails: [string, string, string][] = [
  ["yazmin63", "Yazmin", "yazmin63@example.com"],
  ["albert", "Albert", "albertha_kub@example.org"],
  ["daneee", "Dane Crooks", "dane.crooks@example.com"],
  ["malika28", "Malika", "malika28@example.net"],
  ["aidenschiller", "Aiden", "aiden.schiller82@example.com"],
  ["eldredlad", "Eldred", "eldred2@example.net"],
  ["luellabotsf", "Luella Botsford", "luella_botsford@example.com"],
];

function getRandomInt(max: number): number {
  // ouput: [0, max-1]
  return Math.floor(Math.random() * max);
}

function getRandomAnimal(): AvatarAnimal {
  const x = getRandomInt(3);
  if (x === 0) {
    return AvatarAnimal.CAT;
  } else if (x === 1) {
    return AvatarAnimal.DOG;
  } else {
    return AvatarAnimal.RABBIT;
  }
}

function getRandomColor(): AvatarColor {
  const x = getRandomInt(3);
  if (x === 0) {
    return AvatarColor.PRIMARY;
  } else if (x === 1) {
    return AvatarColor.SECONDARY;
  } else {
    return AvatarColor.TERTIARY;
  }
}

function getRandomBg(): string {
  const x = getRandomInt(3);
  if (x === 0) {
    return "#cbe8e0";
  } else if (x === 1) {
    return "#c9b2e1";
  } else {
    return "#c2d5eb";
  }
}

const taskNames: [string, Date, Date][] = [
  [
    "Watch lectures for CS1010",
    new Date(2021, 8, 1, 10, 0),
    new Date(2021, 8, 7, 23, 0),
  ],
  ["Run 8km", new Date(2021, 8, 1, 10, 0), new Date(2021, 8, 7, 23, 0)],
  ["Do IPPT", new Date(2021, 8, 1, 10, 0), new Date(2021, 8, 15, 23, 0)],
  [
    "Submit that hard af problem set",
    new Date(2021, 8, 1, 10, 0),
    new Date(2021, 8, 15, 23, 0),
  ],
  [
    "Complete assignment for GET1210",
    new Date(2021, 8, 1, 10, 0),
    new Date(2021, 8, 15, 23, 0),
  ],
  [
    "Write research paper for GES1001",
    new Date(2021, 8, 1, 10, 0),
    new Date(2021, 8, 15, 23, 0),
  ],
  [
    "Apply for internship to shopee",
    new Date(2021, 8, 1, 10, 0),
    new Date(2021, 8, 15, 23, 0),
  ],
  [
    "Submit PR for the assigned issue",
    new Date(2021, 8, 1, 10, 0),
    new Date(2021, 8, 12, 23, 0),
  ],
  ["Do 100 pushups", new Date(2021, 8, 1, 10, 0), new Date(2021, 8, 3, 23, 0)],
  ["Do 100 situps", new Date(2021, 8, 1, 10, 0), new Date(2021, 8, 3, 23, 0)],
];

async function main() {
  await prisma.user.createMany({
    data: seedEmails.map((t) => {
      return {
        username: t[0],
        name: t[1],
        email: t[2],
        avatar_animal: getRandomAnimal(),
        avatar_color: getRandomColor(),
        avatar_bg: getRandomBg(),
      };
    }),
  });

  const users: { userId: string }[] = await prisma.user.findMany({
    select: {
      userId: true,
    },
  });

  const sharedJoin = new Date(2021, 8, 1, 10, 0);
  const sharedStart = new Date(2021, 8, 2, 10, 0);
  const sharedComplete = new Date(2021, 8, 2, 13, 0);

  for (const t of taskNames) {
    await prisma.challenge.create({
      data: {
        title: t[0],
        startAt: sharedStart,
        endAt: t[2],
        type: ChallengeType.NOT_COMPLETED,
        ownerId: users[0].userId,
        has_released_result: true,
        participants: {
          createMany: {
            data: users.map((u) => ({
              userId: u.userId,
              joined_at: sharedJoin,
              completed_at: getRandomInt(3) === 2 ? undefined : sharedComplete,
              has_been_vetoed: getRandomInt(15) === 14 ? true : false,
            })),
          },
        },
      },
    });
  }

  for (const u1 of users) {
    for (const u2 of users) {
      if (u1.userId === u2.userId) {
        continue;
      } else {
        await prisma.contact.create({
          data: {
            pers1_id: u1.userId,
            pers2_id: u2.userId,
          },
        });
      }
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
