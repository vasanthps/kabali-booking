"use strict";

let fs = require('fs');
let XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
let cheerio = require('cheerio');
let nodemailer = require('nodemailer');
let beep = require('beepbeep');
let auth = require('./auth.json');

//Update your movie link
let movieUrl = "https://in.bookmyshow.com/buytickets/kabali-bengaluru/movie-bang-ET00039091-MT/20160722";

//Set this to the number of theatres already available
let theatreOffsetCount = 6;
let currentCount = theatreOffsetCount;

let selector = "body > section.phpShowtimes.showtimes > div:nth-child(2) > div > ul";

let checkForTheatreAdditions = () => {

  let xhr = new XMLHttpRequest();
  xhr.open('GET', movieUrl, true);
  xhr.send();
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4 && xhr.status == 200) {
      let $ = cheerio.load(xhr.responseText);
      if($(selector).children().length > currentCount) {
        currentCount = $(selector).children().length;

        fs.appendFileSync('output.log', `New theatre found! - ${(new Date()).toString()} \n`);

        beep(20, 500); //alarm

        let transporter = nodemailer.createTransport({
          service: 'Gmail',
          auth: {
              user: auth.email,
              pass: auth.password
          }
        });
        // setup e-mail data with unicode symbols
        let mailOptions = {
            from: `Bookmyshow <${auth.email}>`, // sender address
            to: auth.toEmails, // list of receivers
            subject: 'New theatre Added', // Subject line
            html: `<b>${movieUrl}</b>` // html body
        };

         // send mail with defined transport object
        transporter.sendMail(mailOptions, function(error, info){
          if(error){
              return fs.appendFileSync('output.log', error);
          }
          fs.appendFileSync('output.log', `Message sent: ${info.response} \n`);
        });

      } else {
        fs.appendFileSync('output.log', `Nothing added yet! Continuing... - ${(new Date()).toString()}\n`);
      }

    }
  };


};

fs.appendFileSync('output.log', 'Starting...\n');

setInterval(checkForTheatreAdditions, 60000);
