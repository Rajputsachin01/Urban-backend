const UserModel = require("../models/userModel")
const { signInToken } = require("../utils/auth")
const Helper = require("../utils/helper")
const bcrypt = require('bcryptjs')
const saltRounds = 10;

async function getUserWithToken(userId) {
  try {
    let userDetail = await userProfile(userId);
    //userDetail.first_name + " " + userDetail.last_name, if we want to send then use it
    const token = signInToken(userId);
    return { token: token, userDetail: userDetail };
  } catch (error) {
    console.log(error);
    return {};
  }
}
const userProfile = async (userId) => {
  try {
    let userProfile = await UserModel.findById(userId).select({
      password: 0,
      __v: 0,
      createdAt: 0,
      updatedAt: 0,
    });
    return userProfile;
  } catch (error) {
    return false;
  }
};
   //for generating 6 digit random otp
   const generateOTP = () =>
    Math.floor(100000 + Math.random() * 900000).toString();
   //For creating user
const register = async (req, res) => {
  try {

    const { 
      email,
      password,
      phoneNo,
      address,
      location,
      referralCode,
    } = req.body;

    // validation for required field
    if (!email) {
      return Helper.fail(res, "email is required");
    }
    if (!password) {
      return Helper.fail(res, "password is required");
    }
    if (!phoneNo) {
      return Helper.fail(res, "phoneNo is required");
    }
    if (!address) {
      return Helper.fail(res, "address is required");
    }
    if (!location) {
      return Helper.fail(res, "location is required");
    }
    // Validating email format
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!emailRegex.test(email)) {
      return Helper.fail(res, "Email is not valid!");
    }
       // Validating phone no.
       if (phoneNo) {
        const phoneRegex = /^\d{6,14}$/; // Allows only digits(0-9) and ensures length is between 6 and 14
  
        if (!phoneRegex.test(phoneNo)) {
          return Helper.fail(res, " number is not valid!");
        }
      }

    let checkObj = { $or: [{ email: email }] };
    if (phoneNo) {
      checkObj.$or.push({ phoneNo: phoneNo });
    }
    let userCheck = await UserModel.find(checkObj);
    if (userCheck.length > 0) {
      return Helper.fail(res, "User already exists with this email or mobile No.!");
    }
 
    // Generate unique referral code
    const generateReferralCode = async () => {
      let isUnique = false,
        uniqueCode;
      while (!isUnique) {
        const letters = String.fromCharCode(
          65 + Math.floor(Math.random() * 26),
          65 + Math.floor(Math.random() * 26)
        );
        const digits = Math.floor(1000 + Math.random() * 9000);
        uniqueCode = `${letters}${digits}`;
        const existingCode = await UserModel.findOne({
          referralCode: uniqueCode,
        });
        if (!existingCode) isUnique = true;
      }
      return uniqueCode;
    };
    const newReferralCode = await generateReferralCode();
    let referredBy = null;
    if (referralCode) {
      const referrer = await UserModel.findOne({ referralCode });
      if (!referrer) {
        return Helper.fail(res, "Invalid Referral Code!");
      }
      referredBy = referrer._id;
    }
    //for hashing password
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    // Generate OTP
    const otp = generateOTP();
    const userObj = { 
      email, 
      password, 
      phoneNo, 
      address, 
      location,
      password: hashedPassword,
      otp: otp,
      referralCode: newReferralCode,
      referredBy,
     };

    const createUser = await UserModel.create(userObj);
     return Helper.success(res, "User registered successfully", createUser);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" })
  } ////
// Generate JWT token and user details
const { token, userDetail } = await getUserWithToken(user._id);
if (!token || !userDetail) {
  return Helper.error(res, "Failed to generate token or get user profile");
}
if (user.referredBy) {
  const referralBonus = 100;

  await WalletModel.findOneAndUpdate(
    { userId: user.referredBy },
    { $inc: { points: referralBonus } },
    { upsert: true } // Creates wallet if not exists
  );

  console.log(`100 points credited to referrer: ${user.referredBy}`);
}

return Helper.success(res, "Token generated successfully.", {
  token,
  userDetail, 
}); ///
}
//for verifying OTP
const verifyOTP = async (req, res) => {
  try {
    const { email, number, otp } = req.body;
    if (!otp) {
      return Helper.fail(res, "  OTP are required");
    }
    if (email) {
      // Validating email format
      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
      if (!emailRegex.test(email)) {
        return Helper.fail(res, "Email is not valid!");
      }
    }
    // Validating phone no.
    if (number) {
      const phoneRegex = /^\d{6,14}$/;
      if (!phoneRegex.test(number)) {
        return Helper.fail(res, " Number is not valid!");
      }
    }
    const user = await UserModel.findOne({
      $or: [{ number: number }, { email: email }],
      otp,
    });

    if (!user) {
      return Helper.fail(res, "Invalid OTP");
    }
    // generateOTP();
    let newotp = "123456";
    await UserModel.updateOne(
      {
        $or: [{ number: number }, { email: email }],
      },
      { $set: { otp: newotp } }
    );
    // Generate JWT token and user details
    const { token, userDetail } = await getUserWithToken(user._id);
    if (!token || !userDetail) {
      return Helper.error("Failed to generate token or get user profile");
    }
    if (user.referredBy) {
      const referralBonus = 100;
      await WalletModel.findOneAndUpdate(
        { userId: user.referredBy },
        { $inc: { points: referralBonus } },
        { upsert: true } // Creates wallet if not exists
      );
      console.log(`100 points credited to referrer: ${user.referredBy}`);
    }

    return Helper.success(res, "Token generated successfully.", {
      token,
      userDetail,
    });
  } catch (error) {
    console.error(error);
    return Helper.fail(res, error.message);
  }
};
//for user login
const login = async (req, res) => {
  try {
    const { phoneNo, email, password} = req.body;

    if (!password) {
      return Helper.fail(res, "Please enter password");
    }
    const query = {};
    if (phoneNo) {
      query.phoneNo = phoneNo;
    }
    if (email) {
      query.email = email;
    }
    const user = await UserModel.findOne({
      $or: [phoneNo ? { phoneNo } : null, email ? { email } : null].filter(
        Boolean
      ),
    });
    const otp = generateOTP();
    // console.log(otp);

    if (!user) {
      return Helper.fail(res, "Email not found, please enter a valid email!");
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return Helper.fail(res, "Invalid password");
    }

    return Helper.success(res, "Login successful", { user });

  } catch (error) {
    console.log(error);
    return Helper.fail(res, "Login failed");
  }
};
module.exports = {
  register,
  login,
  verifyOTP
  
};