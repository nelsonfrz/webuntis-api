import { Lesson, WebUntis } from "webuntis";

let untis: WebUntis;

async function setupUntis() {
  untis = new WebUntis(
    Bun.env.SCHOOL_NAME!,
    Bun.env.USER_NAME!,
    Bun.env.USER_PASSWORD!,
    Bun.env.UNTIS_SERVER!
  );
  await untis.login();
}

async function getTimetableString(day: number, month: number, year: number) {
  let lessons: Lesson[] = [];
  try {
    lessons = await untis.getOwnTimetableFor(new Date(year, month - 1, day));
  } catch {
    setupUntis();
  }

  if (!lessons) {
    return "Sorry, no data found.";
  }

  lessons = lessons.sort((a, b) => a.startTime - b.startTime);

  let timetable = lessons
    .filter((lesson) => lesson.code !== "cancelled")
    .map((lesson) => ({
      ...lesson,
      su: lesson.su.map((subject) => ({
        ...subject,
        longname: subject.longname.replace(", zweiter Parallelkurs", ""),
      })),
    }))
    .map((lesson, index) =>
      lesson.su.map((subject) => `${index + 1}. ${subject.longname}`).join(", ")
    )
    .join("\n");

  return timetable;
}

setupUntis();

Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);
    const searchParams = new URLSearchParams(url.search);
    const day = searchParams.get("day");
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    if (!day || !month || !year) {
      return new Response("day, month and year query params are obligatory.");
    }

    const parsedDay = parseInt(day);
    const parsedMonth = parseInt(month);
    const parsedYear = parseInt(year);

    const timetable = await getTimetableString(
      parsedDay,
      parsedMonth,
      parsedYear
    );

    console.log({ parsedDay, parsedMonth, parsedYear });

    return new Response(timetable);
  },
});
