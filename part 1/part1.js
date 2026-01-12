const fs = require("node:fs");
// Question 1
const readStream = fs.createReadStream("./big.txt", {
  highWaterMark: 64
});

readStream.on("data", (chunk) => {
  console.log("Received chunk:");
  let data = "";
  data += chunk;
  console.log(data);
  console.log("====================");
  
});

readStream.on("end", () => {
  console.log("File is finished");
});

// Question 2
const readStream2 = fs.createReadStream("./source.txt")
const writeStream2 = fs.createWriteStream("./destination.txt");

readStream2.on("data", (chunk) => {
  writeStream2.write(chunk);
})

readStream2.on("end", () => {
  writeStream2.end();
  console.log("File copied.");
})

// Question 3
const gzip = require("node:zlib").createGzip();
const inp = fs.createReadStream("./data.txt")
const out = fs.createWriteStream("./data.txt.gz");
inp.pipe(gzip).pipe(out);