require('dotenv').config();
const jwt = require('jsonwebtoken');
const signInToken = (userId, type) => {
  return jwt.sign(
    {
      userId,
      type
    },
    process.env.JWT_SECRET,
  );
};

const isAuth = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    if (authorization) {
        const token = authorization?.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
          return res.status(401).send({
            message: 'Authorization required',
            status: 0,
            data: null,
          });
        }
        req.userId = decoded?.userId
        req.type = decoded?.type
      }
    next(); 
  } catch (error) {
    console.error("JWT Verification Error:", error);
    return res.status(401).send({
      status: false,
      message: "Unauthorized: " + error.message,
      data: null,
    });
  }
};

module.exports = isAuth;


module.exports = {
    signInToken,
    isAuth
}