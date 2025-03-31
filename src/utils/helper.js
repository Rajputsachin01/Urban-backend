const { default: mongoose } = require("mongoose");

function fail(res, msg) {
    return res.status(200).send({ status: false, message: msg, data: null });
};
  
function success(res, msg, data) {
    return res.status(200).send({ status: true, message: msg, data: data });
};
  
function error(res, msg, err) {
    return res.status(500).send({ status: false, message: msg || 'Internal Server Error' });
};
module.exports = {
    fail,
    success,
    error,
};  