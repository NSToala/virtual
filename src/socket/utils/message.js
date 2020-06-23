const moment = require('moment');

let generateMessage = (name, from, text, photo) => {
  return {
    name,
    from,
    text,
    photo,
    createdAt: moment().valueOf()
  };
};

module.exports = {generateMessage};
