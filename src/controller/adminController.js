const AdminModel = require("../models/adminModel")
const { signInToken } = require("../utils/auth")
const Helper = require("../utils/helper")
const bcrypt = require('bcrypt')
const saltRounds = 10;

async function getUserWithToken(adminId) {
  try {
    let adminDetail = await adminProfile(adminId);
    //adminDetail.first_name + " " + adminDetail.last_name, if we want to send then use it
    const token = signInToken(adminId);
    return { token: token, adminDetail: adminDetail };
  } catch (error) {
    console.log(error);
    return {};
  }
}
const adminProfile = async (adminId) => {
  try {
    let adminProfile = await AdminModel.findById(adminId).select({
      password: 0,
      __v: 0,
      createdAt: 0,
      updatedAt: 0,
    });
    return adminProfile;
  } catch (error) {
    return false;
  }
};
   //for generating 4 digit random otp
   const generateOTP = () =>
    Math.floor(1000 + Math.random() * 9000).toString();

   //For creating admin
const adminRegister = async (req, res) => {
  try {
    const { 
      // profileImage,
      firstName,
      lastName,
      email,
      password,
      phoneNo
    } = req.body;
    console.log(req.body);

    // validation for required field
    if (!firstName) {
      return Helper.fail(res, "FirstName is required");
    }
    if (!lastName) {
      return Helper.fail(res, "LastName is required");
    }
    if (!email) {
      return Helper.fail(res, "Email is required");
    }
    if (!password) {
      return Helper.fail(res, "Password is required");
    }
    if (!phoneNo) {
        return Helper.fail(res, "PhoneNo is required");
      }
    // Validating email format
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!emailRegex.test(email)) {
      return Helper.fail(res, "Email is not valid!");
    }

    let checkObj = { $or: [{ email: email }] };
    if (phoneNo) {
      checkObj.$or.push({ phoneNo: phoneNo });
    }
    let adminCheck = await AdminModel.find(checkObj);
    if (adminCheck.length > 0) {
      return Helper.fail(res, "Admin already exists with this email or mobile!");
    }
 
    // // Generate unique referral code
    // const generateReferralCode = async () => {
    //   let isUnique = false,
    //     uniqueCode;
    //   while (!isUnique) {
    //     const letters = String.fromCharCode(
    //       65 + Math.floor(Math.random() * 26),
    //       65 + Math.floor(Math.random() * 26)
    //     );
    //     const digits = Math.floor(1000 + Math.random() * 9000);
    //     uniqueCode = `${letters}${digits}`;
    //     const existingCode = await UserModel.findOne({
    //       referralCode: uniqueCode,
    //     });
    //     if (!existingCode) isUnique = true;
    //   }
    //   return uniqueCode;
    // };
    // const newReferralCode = await generateReferralCode();
    // let referredBy = null;
    // if (referralCode) {
    //   const referrer = await UserModel.findOne({ referralCode });
    //   if (!referrer) {
    //     return Helper.fail(res, "Invalid Referral Code!");
    //   }
    //   referredBy = referrer._id;
    // }
    //for hashing password
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    // Generate OTP
    const otp = generateOTP();

    // Validating phone no.
    if (phoneNo) {
      const phoneRegex = /^\d{6,14}$/; // Allows only digits(0-9) and ensures length is between 6 and 14

      if (!phoneRegex.test(phoneNo)) {
        return Helper.fail(res, " number is not valid!");
      }
    }

    const userObj = { 
      // profileImage,
      firstName,
      lastName,
      email, 
      phoneNo,
      password: hashedPassword,
      otp: otp,
        
     };

    const createAdmin = await AdminModel.create(userObj);
  
     return Helper.success(res, "Admin registered successfully", createAdmin);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" })
  } ////
// Generate JWT token and user details
const { token, adminDetail } = await getUserWithToken(createAdmin._id);
if (!token || !adminDetail) {
  return Helper.error(res, "Failed to generate token or get admin profile");
}
// if (user.referredBy) {
//   const referralBonus = 100;

//   await WalletModel.findOneAndUpdate(
//     { userId: user.referredBy },
//     { $inc: { points: referralBonus } },
//     { upsert: true } // Creates wallet if not exists
//   );

//   console.log(`100 points credited to referrer: ${user.referredBy}`);
// }

return Helper.success(res, "Token generated successfully.", {
  token,
  userDetail, 
}); ///
}
//for verifying OTP
const verifyOTP = async (req, res) => {
  try {
    const { email, phoneNo, otp } = req.body;
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
    if (phoneNo) {
      const phoneRegex = /^\d{6,14}$/;
      if (!phoneRegex.test(phoneNo)) {
        return Helper.fail(res, " phoneNo is not valid!");
      }
    }
    const user = await AdminModel.findOne({
      $or: [{ phoneNo: phoneNo }, { email: email }],
      otp,
    });

    if (!user) {
      return Helper.fail(res, "Invalid OTP");
    }
    // generateOTP();
    let newotp = "123456";
    await AdminModel.updateOne(
      {
        $or: [{ phoneNo: phoneNo }, { email: email }],
      },
      { $set: { otp: newotp } }
    );
    // Generate JWT token and user details
    const { token, adminDetail } = await getUserWithToken(user._id);
    if (!token || !adminDetail) {
      return Helper.error("Failed to generate token or get admin profile");
    }
    // if (user.referredBy) {
    //   const referralBonus = 100;

    //   await WalletModel.findOneAndUpdate(
    //     { userId: user.referredBy },
    //     { $inc: { points: referralBonus } },
    //     { upsert: true } // Creates wallet if not exists
    //   );

    //   console.log(`100 points credited to referrer: ${user.referredBy}`);
    // }

    return Helper.success(res, "Token generated successfully.", {
      token,
      adminDetail,
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
    const admin = await adminModel.findOne({
      $or: [phoneNo ? { phoneNo } : null, email ? { email } : null].filter(
        Boolean
      ),
    });
    const otp = generateOTP();
    // console.log(otp);

    if (!admin) {
      return Helper.fail(res, "Email not found, please enter a valid email!");
    }
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return Helper.fail(res, "Invalid password");
    }

    return Helper.success(res, "Login successful", { admin });

  } catch (error) {
    console.log(error);
    return Helper.fail(res, "Login failed");
  }
};
module.exports = {
  adminRegister,
  login,
  verifyOTP
  
};

// const query = {};
// if (phoneNo) query.phoneNo = phoneNo;
// if (email) query.email = email;

// const user = await adminModel.findOne(query);
