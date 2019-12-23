const express = require('express');
const fetch = require('isomorphic-fetch');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { Transform } = require('stream');
const { Readable } = require('stream');

const ENCRYPTION_KEY = 'reegai9giefea5oongoo0goomaFoo8ha'; // Must be 256 bits (32 characters)
const IV_LENGTH = 16; // For AES, this is always 16

const app = express();

app.set('view engine', 'ejs');

class AppendInitVect extends Transform {
  constructor(initVect, opts) {
    super(opts);
    this.initVect = initVect;
    this.appended = false;
  }

  _transform(chunk, encoding, cb) {
    if (!this.appended) {
      this.push(this.initVect);
      this.appended = true;
    }
    this.push(chunk);
    cb();
  }
}

app.get('/', (req, res) => {
  //   let iv = crypto.randomBytes(IV_LENGTH);
  //   const gzip = zlib.createGzip();
  //   const readStream = fs.createReadStream(path.join(__dirname, 'icon.png'));
  //   const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  //   const appendInitVect = new AppendInitVect(iv);
  //   const writeStream = fs.createWriteStream(path.join('icon.png' + '.enc'));

  //   readStream
  //     .pipe(gzip)
  //     .pipe(cipher)
  //     .pipe(appendInitVect)
  //     .pipe(writeStream);

  const readStream = fs.createReadStream(path.join(__dirname, 'icon.png.enc'));
  const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  const unzip = zlib.createUnzip();
  const writeStream = fs.createWriteStream(
    path.join(__dirname, 'icon.unenc.png')
  );

  readStream
    .pipe(decipher)
    .pipe(unzip)
    .pipe(writeStream);

  return res.json({});
  const url = 'https://storage.googleapis.com/pl-public-assets/icon.png.enc';
  fetch(url)
    .then(resp => resp.buffer())
    .then(buffer => {
      const content = buffer.slice(16, buffer.length);
      const iv2 = buffer.slice(0, 16);
      const readable = new Readable();
      readable._read = () => {};
      readable.push(content);
      readable.push(null);
      const decipher = crypto.createDecipheriv(
        'aes-256-cbc',
        ENCRYPTION_KEY,
        iv2
      );
      const unzip = zlib.createUnzip();

      readable
        .pipe(decipher)
        .pipe(unzip)
        .pipe(res);
    });
});

app.get('/movie', (req, res) => {
  res.render('movie');
});

app.get('/video', (req, res) => {
  const iv = 'eiphio4ohf5ieHa8';
  //   const gzip = zlib.createGzip();
  //   const readStream = fs.createReadStream(path.join(__dirname, 'P6090053.mp4'));
  //   const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  //   const writeStream = fs.createWriteStream(path.join('P6090053.mp4' + '.enc'));

  //   readStream
  //     .pipe(gzip)
  //     .pipe(cipher)
  //     .pipe(writeStream);

  //   return res.json('Done!');

  const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  const unzip = zlib.createUnzip();
  const url =
    'https://storage.googleapis.com/pl-public-assets/P6090053.mp4.enc';
  fetch(url).then(resp => {
    resp.body
      .pipe(decipher)
      .pipe(unzip)
      .pipe(res);
  });
});

app.listen(8000, () => console.log('listening on port 8000'));
