module.exports = {
  layout: null,
  eleventyComputed: {
    permalink: (data) => `${data.page.filePathStem}/`
  }
};