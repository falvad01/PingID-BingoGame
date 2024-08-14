/*
 * Transforma date to ecpoch format
 * @param {*} thedate
 * @returns
 */
function dateToEpoch(thedate) {
  var time = thedate.getTime();
  return time - (time % 86400000);
}

module.exports = { dateToEpoch };
