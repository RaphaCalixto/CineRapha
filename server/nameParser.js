/**
 * Name Parser: Cleans movie folder & file names to extract precise title and year.
 */

export function parseMovieName(fileName, dirName) {
  // Remove file extension
  let rawName = fileName.replace(/\.(mp4|mkv|avi|mov|wmv|flv|webm|m4v|ts|vob)$/i, '');

  // Extract year (4 digits starting with 19xx or 20xx)
  let year = null;
  const yearMatch = rawName.match(/[\s\.\(\[\-_](19\d{2}|20\d{2})[\s\.\)\]\-_]/);
  if (yearMatch) {
    year = yearMatch[1];
  } else if (dirName) {
    const dirYearMatch = dirName.match(/[\s\.\(\[\-_](19\d{2}|20\d{2})[\s\.\)\]\-_]/);
    if (dirYearMatch) year = dirYearMatch[1];
  }

  // Remove common scene tags
  let clean = rawName;
  const junkPatterns = [
    /1080p/gi, /720p/gi, /2160p/gi, /4k/gi, /uhd/gi, /hdrip/gi, /bluray/gi, /bdrip/gi,
    /brrip/gi, /webrip/gi, /web-dl/gi, /hdtv/gi, /x264/gi, /x265/gi, /hevc/gi, /h264/gi,
    /aac/gi, /dts/gi, /ac3/gi, /5\.1/gi, /7\.1/gi, /dual/gi, /legendado/gi, /dublado/gi,
    /pt-br/gi, /remux/gi, /extended/gi, /directors cut/gi, /unrated/gi, /multi/gi,
    /subbed/gi, /yts/gi, /rarbg/gi, /sparks/gi, /cmrg/gi, /encoder by/gi, /carlos josé/gi,
    /www\.bludv\.(tv|com)/gi, /lucas firmo/gi, /totti9/gi, /lossy/gi, /dual audio/gi
  ];

  junkPatterns.forEach(pattern => {
    clean = clean.replace(pattern, '');
  });

  // Remove year from title string if present
  if (year) {
    clean = clean.replace(new RegExp(`\\b${year}\\b`, 'g'), '');
  }

  // Replace dots, underscores, dashes with spaces
  clean = clean.replace(/[\._\-]+/g, ' ');

  // Clean up brackets and parentheses
  clean = clean.replace(/[\(\)\[\]\{\}]/g, ' ');

  // Trim spaces
  clean = clean.replace(/\s+/g, ' ').trim();

  // If clean title becomes empty, fallback to dirName or rawName
  if (!clean || clean.length < 2) {
    clean = dirName || rawName;
  }

  return {
    raw: fileName,
    title: clean,
    cleanTitle: clean,
    year: year || null
  };
}
