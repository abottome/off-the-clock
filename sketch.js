// ============================================================
// LIFE AS TIME: a clock that shows today, this week, this year,
// and an 80-year life, all moving with the real clock.
// ============================================================

// ---------- SETTINGS (the things you might want to change) ----------
const BIRTH_YEAR = 1993;
const BIRTH_MONTH = 9;   // October. JavaScript counts months from 0, so Jan = 0 ... Dec = 11
const BIRTH_DAY = 15;
const LIFESPAN = 80;     // years

// To preview another date (e.g. Monday's class), put a date in quotes here,
// like "2026-10-26T18:00:00". Set it back to null for the real date.
// (It changes the day/week/year parts. The clock box always shows real time.)
const TEST_DATE = null;

// ---------- LAYOUT (all in pixels) ----------
// The design is drawn on a 900 x 800 area, then automatically shrunk or
// stretched to fit whatever window it is opened in.
const CANVAS_W = 900;
const CANVAS_H = 800;
const GRID_LEFT = 20;
const GRID_RIGHT = 880;
const GRID_TOP = 300;
const GRID_BOTTOM = 780;

// ---------- COLORS (filled in inside setup) ----------
let YELLOW, BLUE, LIGHT_BLUE, PINK, BAR_GRAY, BLACK;

// remembers the last minute we logged, so we only log when it changes
let lastMinute = -1;


// setup() runs once, when the page loads
function setup() {
  createCanvas(windowWidth, windowHeight);   // fill the whole window
  rectMode(CENTER);
  textFont('Helvetica, Arial, sans-serif');

  YELLOW = color(255, 192, 67);
  BLUE = color(45, 100, 140);
  LIGHT_BLUE = color(90, 140, 210);
  PINK = color(236, 50, 134);
  BAR_GRAY = color(190);
  BLACK = color(0);
}


// runs by itself whenever the window is resized
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}


// draw() runs about 60 times per second
function draw() {
  background(0);

  // shrink or grow the whole drawing so it fits the window, centered
  let s = min(width / CANVAS_W, height / CANVAS_H);
  translate((width - CANVAS_W * s) / 2, (height - CANVAS_H * s) / 2);
  scale(s);

  // "now" is the real date and time (or the test date, if you set one)
  let now = TEST_DATE ? new Date(TEST_DATE) : new Date();

  logMinuteChange();
  drawHeader(now);
  drawDotBar(180, 7, getDayIndex(now));    // days of the week
  drawDotBar(235, 4, getWeekIndex(now));   // weeks of the month
  drawGrid(now);                           // the 80 years
}


// ---------- Console log (assignment requirement) ----------
function logMinuteChange() {
  if (minute() !== lastMinute) {
    console.log(minute());
    lastMinute = minute();
  }
}


// ---------- Little helper calculations ----------

// your age today (33 right now)
function getAge(now) {
  let age = now.getFullYear() - BIRTH_YEAR;
  let birthdayThisYear = new Date(now.getFullYear(), BIRTH_MONTH, BIRTH_DAY);
  if (now < birthdayThisYear) {
    age = age - 1;   // birthday hasn't happened yet this year
  }
  return age;
}

// which day of the week it is, counting Monday as 0 ... Sunday as 6
function getDayIndex(now) {
  return (now.getDay() + 6) % 7;   // getDay() gives Sunday = 0, so we shift it
}

// which week of the month it is, 0 to 3 (days 29-31 count as week 4)
function getWeekIndex(now) {
  return min(3, floor((now.getDate() - 1) / 7));
}


// ---------- Top row: age, clock box, years left ----------
function drawHeader(now) {
  let age = getAge(now);
  let yearsLeft = max(0, LIFESPAN - age);

  // the time of day that has passed so far, like 18h:00m:00s
  let timeText = nf(hour(), 2) + 'h:' + nf(minute(), 2) + 'm:' + nf(second(), 2) + 's';

  textAlign(CENTER, CENTER);
  noStroke();
  textSize(80);
  fill(YELLOW);
  text(age, 220, 90);
  fill(LIGHT_BLUE);
  text(yearsLeft, 680, 90);

  // pink clock box
  stroke(255);
  strokeWeight(2);
  fill(PINK);
  rect(450, 90, 290, 70);

  noStroke();
  fill(255);
  textSize(32);
  text(timeText, 450, 90);
}


// ---------- A line with dots (used for both days and weeks) ----------
// y = height on the canvas, total = how many dots, currentIndex = which dot is "now"
function drawDotBar(y, total, currentIndex) {
  stroke(BAR_GRAY);
  strokeWeight(6);
  line(0, y, CANVAS_W, y);

  let spacing = CANVAS_W / total;

  for (let i = 0; i < total; i++) {
    let x = spacing * (i + 0.5);

    stroke(255);
    strokeWeight(2);

    if (i < currentIndex) {
      fill(YELLOW);                      // finished
    } else if (i === currentIndex) {
      // in progress: pulse between dark and pink
      let t = map(sin(millis() / 250), -1, 1, 0.2, 1);
      fill(lerpColor(BLACK, PINK, t));
    } else {
      fill(BLUE);                        // hasn't started
    }

    circle(x, y, 24);
  }
}


// ---------- The big grid: one line per year of life ----------
function drawGrid(now) {
  let gridW = GRID_RIGHT - GRID_LEFT;
  let gridH = GRID_BOTTOM - GRID_TOP;
  let rowGap = gridH / 40;   // space between horizontal lines
  let colGap = gridW / 40;   // space between vertical lines

  // Which line is this year? (2026 - 1993 = 33)
  // We count 2026 as the "age 32" year, so 32 lines are finished and line 33 is in progress.
  let currentLine = now.getFullYear() - BIRTH_YEAR;

  // How far through this calendar year are we? (0 = Jan 1, 1 = Dec 31)
  let yearStart = new Date(now.getFullYear(), 0, 1);
  let nextYearStart = new Date(now.getFullYear() + 1, 0, 1);
  let yearProgress = (now - yearStart) / (nextYearStart - yearStart);

  strokeWeight(2);

  for (let n = 1; n <= LIFESPAN; n++) {
    // finished years are yellow, everything else starts out blue
    if (n < currentLine) {
      stroke(YELLOW);
    } else {
      stroke(BLUE);
    }

    if (n % 2 === 1) {
      // odd-numbered years are horizontal lines, left to right
      let y = GRID_TOP + ((n - 1) / 2 + 0.5) * rowGap;
      line(GRID_LEFT, y, GRID_RIGHT, y);

      if (n === currentLine) {
        stroke(PINK);
        line(GRID_LEFT, y, GRID_LEFT + gridW * yearProgress, y);
      }
    } else {
      // even-numbered years are vertical lines, top to bottom
      let x = GRID_LEFT + (n / 2 - 0.5) * colGap;
      line(x, GRID_TOP, x, GRID_BOTTOM);

      if (n === currentLine) {
        stroke(PINK);
        line(x, GRID_TOP, x, GRID_TOP + gridH * yearProgress);
      }
    }
  }
}