let melody = [
  {
    name: "C",
    content: ["A3", "B3", "C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5", "D5", "E5", "F5", "G5", "A5", "B5"],
  },
  {
    name: "G",
    content: ["A3", "B3", "C4", "D4", "E4", "F4#", "G4", "A4", "B4", "C5", "D5", "E5", "F5#", "G5", "A5", "B5"],
  },
  {
    name: "D",
    content: ["A3", "B3", "C4#", "D4", "E4", "F4#", "G4", "A4", "B4", "C5#", "D5", "E5", "F5#", "G5", "A5", "B5"],
  },
];

let tone = [
  {
    note: "E3",
    freq: 165,
  },
  {
    note: "F3",
    freq: 174,
  },
  {
    note: "F3#",
    freq: 185,
  },
  {
    note: "G3",
    freq: 196,
  },
  {
    note: "G3#",
    freq: 208,
  },
  {
    note: "A3",
    freq: 220,
  },
  {
    note: "B3♭",
    freq: 233,
  },
  {
    note: "B3",
    freq: 245,
  },
  {
    note: "C4",
    freq: 261,
  },
  {
    note: "C4#",
    freq: 277,
  },
  {
    note: "D4",
    freq: 294,
  },
  {
    note: "E4♭",
    freq: 311,
  },
  {
    note: "E4",
    freq: 330,
  },
  {
    note: "F4",
    freq: 349,
  },
  {
    note: "F4#",
    freq: 370,
  },
  {
    note: "G4",
    freq: 392,
  },
  {
    note: "G4#",
    freq: 415,
  },
  {
    note: "A4",
    freq: 440,
  },
  {
    note: "B4♭",
    freq: 466,
  },
  {
    note: "B4",
    freq: 494,
  },
  {
    note: "C5",
    freq: 523,
  },
  {
    note: "C5#",
    freq: 554,
  },
  {
    note: "D5",
    freq: 587,
  },
  {
    note: "E5♭",
    freq: 622,
  },
  {
    note: "E5",
    freq: 660,
  },
  {
    note: "F5",
    freq: 698,
  },
  {
    note: "F5#",
    freq: 739,
  },
  {
    note: "G5",
    freq: 784,
  },
  {
    note: "G5#",
    freq: 830,
  },
  {
    note: "A5",
    freq: 880,
  },
  {
    note: "B5♭",
    freq: 932,
  },
  {
    note: "B5",
    freq: 988,
  },
  {
    note: "B5",
    freq: 988,
  },
];

function autoCorrelate(buf, sampleRate) {
  let SIZE = buf.length;
  let rms = 0;

  for (let i = 0; i < SIZE; i++) {
    let val = buf[i];
    rms += val * val;
  }
  rms = Math.sqrt(rms / SIZE);
  if (rms < 0.01) return -1;

  let r1 = 0,
    r2 = SIZE - 1,
    thres = 0.2;
  for (let i = 0; i < SIZE / 2; i++)
    if (Math.abs(buf[i]) < thres) {
      r1 = i;
      break;
    }
  for (let i = 1; i < SIZE / 2; i++)
    if (Math.abs(buf[SIZE - i]) < thres) {
      r2 = SIZE - i;
      break;
    }

  buf = buf.slice(r1, r2);
  SIZE = buf.length;

  let c = new Array(SIZE).fill(0);
  for (let i = 0; i < SIZE; i++) for (let j = 0; j < SIZE - i; j++) c[i] = c[i] + buf[j] * buf[j + i];

  let d = 0;
  while (c[d] > c[d + 1]) d++;
  let maxval = -1,
    maxpos = -1;
  for (let i = d; i < SIZE; i++) {
    if (c[i] > maxval) {
      maxval = c[i];
      maxpos = i;
    }
  }
  let T0 = maxpos;

  let x1 = c[T0 - 1],
    x2 = c[T0],
    x3 = c[T0 + 1];
  let a = (x1 + x3 - 2 * x2) / 2;
  let b = (x3 - x1) / 2;
  if (a) T0 = T0 - b / (2 * a);

  return sampleRate / T0;
}

function findCloseNum(arr, num) {
  let index = 0;
  let d_value = Number.MAX_VALUE;
  for (let i = 0; i < arr.length; i++) {
    let new_d_value = Math.abs(arr[i].freq - num);
    if (new_d_value <= d_value) {
      if (new_d_value === d_value && arr[i].freq < arr[index]) {
        continue;
      }
      index = i;
      d_value = new_d_value;
    }
  }
  return arr[index];
}

function findTone(n) {
  let freq = 0;
  let arr = tone;
  for (let i = 0, length = arr.length; i < length; i++) {
    if (arr[i].note === n) {
      freq = arr[i].freq;
    }
  }
  return freq;
}

let Recorder = function (stream) {
  let context = new AudioContext();
  let audioInput = context.createMediaStreamSource(stream);
  let recorder = context.createScriptProcessor(4096, 1, 1);
  this.recorder = recorder;
  this.start = function () {
    audioInput.connect(recorder);
    recorder.connect(context.destination);
  };
};
