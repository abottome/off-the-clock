// ============================================================
// LIFE AS TIME: seconds, minutes, hours, days, weeks and an
// 80-year life, all moving with the real clock.
// ============================================================

// ---------- SETTINGS (the things you might want to change) ----------
const BIRTH_YEAR = 1993;
const LIFESPAN = 80;     // years

// To preview another date (e.g. Monday's class), put a date in quotes here,
// like "2026-10-26T18:00:00". Set it back to null for the real date.
// (It changes the day/week/year parts. The seconds, minutes and hours rows
// always show real time.)
const TEST_DATE = null;

// ---------- LAYOUT (all in pixels) ----------
// The design is drawn on a fixed-size area, then automatically shrunk or
// stretched to fit whatever window it is opened in.
const CANVAS_W = 900;
const PAD = 4;           // small empty border so edge lines never get cut off

// Rows of circles: the first row's height (empty space above it),
// and the distance between rows. Every row is the same distance from the
// next, whatever the circle size.
const BARS_TOP = 36;
const BAR_SPACING = 50;
const WEEKS_EXTRA = 8;

// The grid starts below the last row (there are 4 gaps between 5 rows).
// GAP_BEFORE_GRID is the space between the last row and the top of the grid.
// GRID_HEIGHT is the grid's own height: it stays the same no matter how
// much you change the spacing above, and the canvas grows to fit.
const GAP_BEFORE_GRID = 56;
const GRID_HEIGHT = 598;
const GRID_LEFT = 0;
const GRID_RIGHT = CANVAS_W;      // lines up with the ends of the bars above
const GRID_TOP = BARS_TOP + 4 * BAR_SPACING + GAP_BEFORE_GRID;
const GRID_BOTTOM = GRID_TOP + GRID_HEIGHT;
const GRID_LINE_THICKNESS = 3;

// total height of the drawing (grid bottom plus a little room)
const CANVAS_H = GRID_BOTTOM + 10;

// Circle sizes. The smallest is the biggest circle that still fits
// 60 across without touching (900 / 60 = 15 pixels each, minus 2 to breathe).
// The others step up evenly from there.
const TINY_DOT = CANVAS_W / 60 - 2;   // seconds and minutes
const HOUR_DOT = 19;
const DAY_DOT = 24;
const WEEK_DOT = 30;

// Thickness of circle outlines and bars, as a fraction of the circle's size
const OUTLINE_AMOUNT = 0.08;
const BAR_AMOUNT = 0.10;

// ---------- COLORS (filled in inside setup) ----------
let NAVY, CREAM, PAST, PRESENT, FUTURE;

// remembers the last minute we logged, so we only log when it changes
let lastMinute = -1;


// setup() runs once, when the page loads
function setup() {
  createCanvas(windowWidth, windowHeight);   // fill the whole window

  NAVY = color(13, 20, 40);         // background
  CREAM = color(250, 240, 220);     // bars and circle outlines
  PAST = color(122, 82, 78);        // time that has finished (earthy)
  PRESENT = color(95, 200, 95);     // time in progress (green)
  FUTURE = color(196, 190, 245);    // time that hasn't started (lilac)
}


// runs by itself whenever the window is resized
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}


// draw() runs about 60 times per second
function draw() {
  background(NAVY);

  // shrink or grow the whole drawing so it fits the window, centered
  let s = min(width / (CANVAS_W + 2 * PAD), height / (CANVAS_H + 2 * PAD));
  translate((width - CANVAS_W * s) / 2, (height - CANVAS_H * s) / 2);
  scale(s);

  // "now" is the real date (or the test date, if you set one)
  let now = TEST_DATE ? new Date(TEST_DATE) : new Date();

  logMinuteChange();

  // The rows of circles, from smallest slice of time to biggest.
  // Arguments: height on screen, how many circles, which one is "now", circle size
  drawDotBar(BARS_TOP, 60, second(), TINY_DOT);                           // seconds in a minute
  drawDotBar(BARS_TOP + BAR_SPACING, 60, minute(), TINY_DOT);             // minutes in an hour
  drawDotBar(BARS_TOP + 2 * BAR_SPACING, 24, hour(), HOUR_DOT);           // hours in a day
  drawDotBar(BARS_TOP + 3 * BAR_SPACING, 7, getDayIndex(now), DAY_DOT);   // days in a week
  drawDotBar(BARS_TOP + 4 * BAR_SPACING + WEEKS_EXTRA, 4, getWeekIndex(now), WEEK_DOT); // weeks in a month

  drawGrid(now);   // the 80 years
}


// ---------- Console log (assignment requirement) ----------
function logMinuteChange() {
  if (minute() !== lastMinute) {
    console.log(minute());
    lastMinute = minute();
  }
}


// ---------- Little helper calculations ----------

// which day of the week it is, counting Monday as 0 ... Sunday as 6
function getDayIndex(now) {
  return (now.getDay() + 6) % 7;   // getDay() gives Sunday = 0, so we shift it
}

// which week of the month it is, 0 to 3 (days 29-31 count as week 4)
function getWeekIndex(now) {
  return min(3, floor((now.getDate() - 1) / 7));
}


// ---------- A bar with circles (used for every row) ----------
// y = height on the canvas, total = how many circles,
// currentIndex = which circle is "now", diameter = circle size
function drawDotBar(y, total, currentIndex, diameter) {
  // thinner outlines and bars for smaller circles (never thinner than 1 pixel)
  let outline = max(1, diameter * OUTLINE_AMOUNT);
  let barThickness = max(1, diameter * BAR_AMOUNT);

  stroke(CREAM);
  strokeWeight(barThickness);
  line(0, y, CANVAS_W, y);

  let spacing = CANVAS_W / total;

  for (let i = 0; i < total; i++) {
    let x = spacing * (i + 0.5);

    stroke(CREAM);
    strokeWeight(outline);

    if (i < currentIndex) {
      fill(PAST);                        // finished
    } else if (i === currentIndex) {
      // in progress: pulse between navy and green
      let t = map(sin(millis() / 250), -1, 1, 0.2, 1);
      fill(lerpColor(NAVY, PRESENT, t));
    } else {
      fill(FUTURE);                      // hasn't started
    }

    circle(x, y, diameter);
  }
}


// ---------- The big grid: one line per year of life ----------
function drawGrid(now) {
  let gridW = GRID_RIGHT - GRID_LEFT;
  let gridH = GRID_BOTTOM - GRID_TOP;

  // 40 lines in each direction means 39 gaps between them. The first line
  // sits on the edge and the last line sits on the opposite edge.
  let rowGap = gridH / 39;   // space between horizontal lines
  let colGap = gridW / 39;   // space between vertical lines

  // Which line is this year? (2026 - 1993 = 33)
  // We count 2026 as the "age 32" year, so 32 lines are finished and line 33 is in progress.
  let currentLine = now.getFullYear() - BIRTH_YEAR;

  // How far through this calendar year are we? (0 = Jan 1, 1 = Dec 31)
  let yearStart = new Date(now.getFullYear(), 0, 1);
  let nextYearStart = new Date(now.getFullYear() + 1, 0, 1);
  let yearProgress = (now - yearStart) / (nextYearStart - yearStart);

  strokeWeight(GRID_LINE_THICKNESS);
  strokeCap(PROJECT);   // squares off the line ends so the corners of the box fill in

  for (let n = 1; n <= LIFESPAN; n++) {
    // finished years are earthy, everything else starts out lilac
    if (n < currentLine) {
      stroke(PAST);
    } else {
      stroke(FUTURE);
    }

    if (n % 2 === 1) {
      // odd-numbered years are horizontal lines, left to right
      let y = GRID_TOP + ((n - 1) / 2) * rowGap;
      line(GRID_LEFT, y, GRID_RIGHT, y);

      if (n === currentLine) {
        stroke(PRESENT);
        line(GRID_LEFT, y, GRID_LEFT + gridW * yearProgress, y);
      }
    } else {
      // even-numbered years are vertical lines, top to bottom
      let x = GRID_LEFT + (n / 2 - 1) * colGap;
      line(x, GRID_TOP, x, GRID_BOTTOM);

      if (n === currentLine) {
        stroke(PRESENT);
        line(x, GRID_TOP, x, GRID_TOP + gridH * yearProgress);
      }
    }
  }
}
