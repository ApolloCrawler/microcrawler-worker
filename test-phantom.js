var phantom = require('phantom');
var cheerio = require('cheerio');
var url = require('url');

var instance = null;
var page = null;
phantom.create().then((res) => {
  instance = res;

  return instance.createPage();
}).then((res) => {
  page = res;
  page.on("onResourceRequested", (requestData) => {
    console.info('Requesting', requestData.url)
  });

  return page.open('http://sreality.cz/hledani/pronajem/byty');
}).then((status) => {
  console.log(status);

  return page.property('content');
}).then((content) => {
  console.log(content);

  var $ = cheerio.load(content);

  $('a.btn-paging').each(function() {
    var tmpUrl = 'http://sreality.cz' + $(this).attr('href');
    var parsedUrl = url.parse(tmpUrl);

    console.log({
      type: 'url',
      url: tmpUrl,
      processor: 'sreality.cz/listing'
    });
  });

  $('span.basic > h2 > a').each(function() {
    var tmpUrl = 'http://sreality.cz' + $(this).attr('href');
    var parsedUrl = url.parse(tmpUrl);

    console.log({
      type: 'url',
      url: tmpUrl,
      processor: 'sreality.cz/details'
    });
  });

  console.log('Done, exitting.');
  return instance.exit();
});
