const UserModel = require("../models/userModel");
const { signInToken } = require("../utils/auth");
const Helper = require("../utils/helper");
const bcrypt = require("bcrypt");
const saltRounds = 10;
async function getUserWithToken(userId, type) {
  try {
    let userDetail = await userProfile(userId);
    //userDetail.first_name + " " + userDetail.last_name, if we want to send then use it
    const token = signInToken(userId, type);
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
//for generating 4 digit random otp
const generateOTP = () => Math.floor(1000 + Math.random() * 9000).toString();
//For creating user
// const registerUser = async (req, res) => {
//   try {
//     const { img, name, email, password, phoneNo, address, location, referralCode } =
//       req.body;

//     // validation for required field
//     if (!img) {
//       return Helper.fail(res, "image is required");
//     }
//     if (!name) {
//       return Helper.fail(res, "name is required");
//     }
//     if (!email) {
//       return Helper.fail(res, "email is required");
//     }
//     if (!password) {
//       return Helper.fail(res, "password is required");
//     }
//     if (!phoneNo) {
//       return Helper.fail(res, "phoneNo is required");
//     }
//     if (!address) {
//       return Helper.fail(res, "address is required");
//     }
//     if (!location) {
//       return Helper.fail(res, "location is required");
//     }
//     // Validating email format
//     const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
//     if (!emailRegex.test(email)) {
//       return Helper.fail(res, "Email is not valid!");
//     }
//     // Validating phone no.
//     if (phoneNo) {
//       const phoneRegex = /^\d{6,14}$/; // Allows only digits(0-9) and ensures length is between 6 and 14
//       if (!phoneRegex.test(phoneNo)) {
//         return Helper.fail(res, " number is not valid!");
//       }
//     }
//     let checkObj = { $or: [{ email: email }] };
//     if (phoneNo) {
//       checkObj.$or.push({ phoneNo: phoneNo });
//     }
//     // let userCheck = await UserModel.find(checkObj, {isDeleted: false});
//     let userCheck = await UserModel.find(checkObj);
//     if (userCheck.length > 0) {
//       return Helper.fail(
//         res,
//         "User already exists with this email or mobile No.!"
//       );
//     }
//     // Generate unique referral code
//     const generateReferralCode = async () => {
//       let isUnique = false,
//         uniqueCode;
//       while (!isUnique) {
//         const letters = String.fromCharCode(
//           65 + Math.floor(Math.random() * 26),
//           65 + Math.floor(Math.random() * 26)
//         );
//         const digits = Math.floor(1000 + Math.random() * 9000);
//         uniqueCode = `${letters}${digits}`;
//         const existingCode = await UserModel.findOne({
//           referralCode: uniqueCode,
//         });
//         if (!existingCode) isUnique = true;
//       }
//       return uniqueCode;
//     };
//     const newReferralCode = await generateReferralCode();
//     let referredBy = null;
//     if (referralCode) {
//       const referrer = await UserModel.findOne({ referralCode });
//       if (!referrer) {
//         return Helper.fail(res, "Invalid Referral Code!");
//       }
//       referredBy = referrer._id;
//     }
//     //for hashing password
//     const hashedPassword = await bcrypt.hash(password, saltRounds);
//     // Generate OTP
//     // const otp = generateOTP();
//     const otp = "1234"
//     const userObj = {
//               userName,
//       img,
//       name,
//       email,
//       phoneNo,
//       address,
//       location,
//       password: hashedPassword ,
//       otp: otp,
//       referralCode: newReferralCode,
//       referredBy,
//     };

//     const createUser = await UserModel.create(userObj);
//     return Helper.success(res, "OTP successfully", createUser);
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };
//new one
const registerUser = async (req, res) => {
  try {
    const {
      img,
      name,
      email,
      password,
      phoneNo,
      address,
      location,
      referralCode,
    } = req.body;

    // 1. Field Validations
    if (!img) return Helper.fail(res, "image is required");
    if (!name) return Helper.fail(res, "name is required");
    if (!email) return Helper.fail(res, "email is required");
    if (!password) return Helper.fail(res, "password is required");
    if (!phoneNo) return Helper.fail(res, "phoneNo is required");
    // if (!address) return Helper.fail(res, "address is required");
    // if (!location) return Helper.fail(res, "location is required");

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!emailRegex.test(email)) return Helper.fail(res, "Email is not valid!");

    const phoneRegex = /^\d{6,14}$/;
    if (!phoneRegex.test(phoneNo))
      return Helper.fail(res, "Phone number is not valid!");

    // 2. Check if user exists with same email or phoneNo
    const existingUser = await UserModel.findOne({
      $or: [{ email }, { phoneNo }],
      isDeleted: false, // only if you use soft deletes
    });

    if (existingUser) {
      return Helper.fail(
        res,
        "User already exists with this email or phone number!"
      );
    }

    // 3. Generate referral code
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
        const existing = await UserModel.findOne({ referralCode: uniqueCode });
        if (!existing) isUnique = true;
      }
      return uniqueCode;
    };

    const newReferralCode = await generateReferralCode();

    // 4. Validate referral code (optional)
    let referredBy = null;
    if (referralCode) {
      const referrer = await UserModel.findOne({ referralCode });
      if (!referrer) return Helper.fail(res, "Invalid Referral Code!");
      referredBy = referrer._id;
    }

    // 5. Hash password
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    let baseName = name.toLowerCase().replace(/\s+/g, "");
    let lastThree = String(phoneNo).slice(-3);
    let userName = `${baseName}${lastThree}`;

    // Ensure username is unique
    let usernameExists = await UserModel.findOne({ userName });
    while (usernameExists) {
      const rand = Math.floor(100 + Math.random() * 900); // random 3 digits
      userName = `${baseName}${rand}`;
      usernameExists = await UserModel.findOne({ userName });
    }

    // 7. Create User
    const otp = "1234"; // For dev only, replace with actual generation
    const userObj = {
      userName,
      img,
      name,
      email,
      phoneNo,
      address,
      location,
      password: hashedPassword,
      otp,
      referralCode: newReferralCode,
      referredBy,
    };

    const createdUser = await UserModel.create(userObj);

    return Helper.success(res, "OTP successfully sent", createdUser);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

//for updating User
const updateUser = async (req, res) => {
  try {
    const userId = req.userId;
    const { img, name, email, phoneNo } = req.body;

    if (!userId) {
      return Helper.fail(res, "User ID is missing from request");
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return Helper.fail(res, "User not found");
    }

    let objToUpdate = {};

    // Validate and update name
    if (name && name !== user.name) {
      objToUpdate.name = name;
    }

    // Validate and update image
    if (img && img !== user.img) {
      objToUpdate.img = img;
    }

    // Validate and update email
    if (email && email !== user.email) {
      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
      if (!emailRegex.test(email)) {
        return Helper.fail(res, "Email is not valid!");
      }

      const existingEmailUser = await UserModel.findOne({
        email: new RegExp(`^${email}$`, "i"),
        _id: { $ne: userId },
      });
      if (existingEmailUser) {
        return Helper.fail(res, "Email is already used in another account");
      }

      objToUpdate.email = email;
    }

    // Validate and update phoneNo
    if (phoneNo && phoneNo !== user.phoneNo) {
      const phoneRegex = /^\d{6,14}$/;
      if (!phoneRegex.test(phoneNo)) {
        return Helper.fail(res, "Phone number is not valid!");
      }

      const existingPhoneUser = await UserModel.findOne({
        phoneNo,
        _id: { $ne: userId },
      });
      if (existingPhoneUser) {
        return Helper.fail(res, "Phone number is already used in another account");
      }

      objToUpdate.phoneNo = phoneNo;
    }
    // Proceed with update only if something has changed
    if (Object.keys(objToUpdate).length === 0) {
      return Helper.success(res, "No changes detected in profile", user);
    }

    const updatedProfile = await UserModel.findByIdAndUpdate(userId, objToUpdate, {
      new: true,
    });

    return Helper.success(res, "User updated successfully!", updatedProfile);
  } catch (error) {
    console.log(error);
    return Helper.fail(res, error.message);
  }
};

//for soft delete User
const removeUser = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return Helper.fail(res, "Please provide User Id ");
    }
    let i = { _id: userId };
    let deleted = await UserModel.findOneAndUpdate(
      i,
      { isDeleted: true },
      { new: true }
    );
    if (!deleted) {
      return Helper.fail(res, "No user found!");
    }
    return Helper.success(res, " User deleted successfully", deleted);
  } catch (error) {
    console.log(error);
    return Helper.fail(res, error.message);
  }
};
//for fetching user profile
const fetchProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await UserModel.findById(userId).select({
      password: 0,
      __v: 0,
      createdAt: 0,
      updatedAt: 0,
    });
    if (!user) {
      return Helper.fail(res, "user not found");
    }
    return Helper.success(res, "Profile fetched successfully", user);
  } catch (error) {
    console.log(error);
    return Helper.fail(res, "Failed to fetch profile");
  }
};
//for finding user By UserId
const findUserById = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return Helper.fail(res, "userId is required");
    }
    const user = await UserModel.findOne({ _id: userId, isDeleted: false });
    if (!user) {
      return Helper.fail(res, "User not found");
    }
    return Helper.success(res, "User found", user);
  } catch (error) {
    console.log(error);
    return Helper.fail(res, "Failed to fetch user");
  }
};
//for verifying OTP
const verifyOTP = async (req, res) => {
  try {
    const { number, otp } = req.body;
    if (!otp) {
      return Helper.fail(res, " OTP are required");
    }

    // Validating phone no.
    if (number) {
      const phoneRegex = /^\d{6,14}$/;
      if (!phoneRegex.test(number)) {
        return Helper.fail(res, " Number is not valid!");
      }
    }
    const user = await UserModel.findOne({ phoneNo: number, otp });

    if (!user) {
      return Helper.fail(res, "Invalid OTP");
    }
    // let newotp = generateOTP();
    let newotp = "1234";
    await UserModel.updateOne({ number: number }, { $set: { otp: newotp } });
    // Generate JWT token and user details
    const type = "user";
    const { token, userDetail } = await getUserWithToken(user._id, type);
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
    // send cookie
    res.cookie("token", token);
    return Helper.success(res, "Token generated successfully.", {
      token,
      userDetail,
    });
  } catch (error) {
    console.error(error);
    return Helper.fail(res, error.message);
  }
};
// resend OTP
const resendOTP = async (req, res) => {
  try {
    const { number } = req.body;

    if (!number) {
      return Helper.fail(res, "Please provide phone number.");
    }
    // Find user using or number
    const user = await UserModel.findOne({ phoneNo: number });

    if (!user) {
      return Helper.fail(res, "User not found!");
    }
    // Generate new OTP and set expiry
    // generateOTP();
    const otp = "1234";
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await UserModel.updateOne({ _id: user._id }, { $set: { otp, otpExpires } });
    return Helper.success(res, "OTP resent successfully.");
  } catch (error) {
    console.error(error);
    return Helper.fail(res, error.message);
  }
};

//for user login
// const loginUser = async (req, res) => {
//   try {
//     // const { phoneNo, email, password } = req.body;
//     const { phoneNo } = req.body
//     if (!password) {
//       return Helper.fail(res, "Please enter password");
//     }
//     const query = {};
//     if (phoneNo) {
//       query.phoneNo = phoneNo;
//     }
//     const user = await UserModel.findOne({
//       $or: [phoneNo ? { phoneNo } : null].filter(
//         Boolean
//       ),
//     });

//     // if (email) {
//     //   query.email = email;
//     // }
//     // const user = await UserModel.findOne({
//     //   $or: [phoneNo ? { phoneNo } : null, email ? { email } : null].filter(
//     //     Boolean
//     //   ),
//     // });

//     const otp = generateOTP();
//     if (!user) {
//       return Helper.fail(res, "User not found ");
//     }
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return Helper.fail(res, "Invalid password");
//     }
//     return Helper.success(res, "Login successfull", user);
//   } catch (error) {
//     console.log(error);
//     return Helper.fail(res, "Login failed");
//   }
// };

// login using only phone number
const loginUser = async (req, res) => {
  try {
    const { phoneNo } = req.body;
    if (!phoneNo) {
      return Helper.fail(res, "phone number is required");
    }
    const query = {};
    if (phoneNo) {
      query.phoneNo = phoneNo;
    }
    const user = await UserModel.findOne({
      $or: [phoneNo ? { phoneNo } : null].filter(Boolean),
      isDeleted: false,
    });
    if (!user) {
      return Helper.fail(res, "User not found ");
    }
    // generateOTP();
    const newotp = "1234";
    user.otp = newotp;
    await user.save();

    // here code for send the otp to user's phone number

    return Helper.success(res, "OTP sent successfull");
  } catch (error) {
    console.log(error);
    return Helper.fail(res, "failed to send OTP");
  }
};

// get user current location
const getUserLocation = async (req, res) => {
  try {
    const userId = req.userId;
    const { newLocation, address } = req.body;
    const user = await UserModel.findById(userId);
    if (!user) {
      return Helper.fail(res, "user not found");
    }
    if (!newLocation) {
      return Helper.fail(res, "please select your location");
    }
    if (!address) {
      return Helper.fail(res, "please enter address");
    }
    let updatedLocation = await UserModel.findByIdAndUpdate(
      userId,
      { location: newLocation, address },
      {
        new: true,
      }
    );
    console.log({ updatedLocation });
    if (!updatedLocation) {
      return Helper.fail(res, "user location not updated");
    }
    return Helper.success(res, "location updated successfully");
  } catch (error) {
    console.log(error);
    return Helper.fail(res, "failed to update location");
  }
};

// fetch referralCode
const fetchReferralCode = async (req, res) => {
  const userId = req.userId;
  if (!userId) {
    return Helper.fail(res, "userId is required");
  }
  const referralCode = await UserModel.findOne({
    _id: userId,
    isDeleted: false,
  }).select("img name email phoneNo referralCode");
  if (!referralCode) {
    return Helper.fail(res, "user not exist");
  }
  return Helper.success(res, "referral code fetched", referralCode);
};

const listingUser = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", status } = req.body;

    const query = {
      isDeleted: { $ne: true },
    };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (status) {
      query.status = status; // ✅ apply status filter only if provided
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await UserModel.countDocuments(query);
    const totalPages = Math.ceil(total / parseInt(limit));

    const users = await UserModel.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    return Helper.success(res, "User list fetched successfully", {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages,
      users,
    });
  } catch (error) {
    console.log(error);
    return Helper.fail(res, error.message);
  }
};

module.exports = {
  registerUser,
  updateUser,
  removeUser,
  fetchProfile,
  findUserById,
  loginUser,
  verifyOTP,
  resendOTP,
  getUserLocation,
  fetchReferralCode,
  listingUser,
};
