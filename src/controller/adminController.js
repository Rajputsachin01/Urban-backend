const AdminModel = require("../models/adminModel")
const UserModel = require("../models/userModel")
const { signInToken } = require("../utils/auth")
const Helper = require("../utils/helper")
const bcrypt = require('bcrypt')
const saltRounds = 10;

async function getUserWithToken(adminId, type) {
  try {
    let adminDetail = await adminProfile(adminId);
    //adminDetail.first_name + " " + adminDetail.last_name, if we want to send then use it
    const token = signInToken(adminId, type);
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
const registerAdmin = async (req, res) => {
  try {
    const {profileImage, firstName, lastName, phoneNo, email, password } = req.body;
    console.log({profileImage, firstName, lastName, phoneNo, email, password })
    // validation for required field
    // if (!profileImage) return Helper.fail(res, "profileImage is required");
    if (!firstName) return Helper.fail(res, "First name is required");
    if (!lastName) return Helper.fail(res, "Last name is required");
    if (!phoneNo) return Helper.fail(res, "Phone number is required");
    if (!email) return Helper.fail(res, "Email is required");
    if (!password) return Helper.fail(res, "Password is required");
    // Validating email format
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!emailRegex.test(email)) {
      return Helper.fail(res, "Email is not valid!");
    }
    // Validating phoneNumber 
    if (phoneNo) {
      const phoneRegex = /^\d{6,14}$/;
      if (!phoneRegex.test(phoneNo)) {
        return Helper.fail(res, " number is not valid!");
      }
    }
    let checkObj = { $or: [{ email: email }] };
    if (phoneNo) {
      checkObj.$or.push({ phoneNo: phoneNo });
    }
    let adminCheck = await AdminModel.find(checkObj);
    if (adminCheck.length > 0) {
      return Helper.fail(res, "Admin already exists with this email or mobile!");
    }
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    // Generate OTP
    // const otp = generateOTP();
    const otp = "1234"
    const userObj = {
      profileImage,
      firstName,
      lastName,
      email,
      phoneNo,
      password: hashedPassword,
      otp: otp,

    };
    const createAdmin = await AdminModel.create(userObj);
    return Helper.success(res, "Admin registered successfully", createAdmin);
  }
  catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" })
  }
}

//for verifying OTP
const verifyOTP = async (req, res) => {
  try {
    const { phoneNo, otp } = req.body;
    if (!otp) {
      return Helper.fail(res, " OTP are required");
    }
    // Validating phone no.
    if (phoneNo) {
      const phoneRegex = /^\d{6,14}$/;
      if (!phoneRegex.test(phoneNo)) {
        return Helper.fail(res, " phoneNo is not valid!");
      }
    }
    const user = await AdminModel.findOne({ phoneNo: phoneNo, otp });
    if (!user) {
      return Helper.fail(res, "Invalid OTP");
    }
    // let newotp = generateOTP();
    let newotp = "1234";
    await AdminModel.updateOne(
      { phoneNo: phoneNo },
      { $set: { otp: newotp } }
    );
    // Generate JWT token and user details
    const type = "admin"
    const { token, adminDetail } = await getUserWithToken(user._id, type);
    if (!token || !adminDetail) {
      return Helper.error("Failed to generate token or get admin profile");
    }
    res.cookie("token", token)
    return Helper.success(res, "otp is verified and Token generated successfully.", {
      token,
      adminDetail,
    });
  } catch (error) {
    console.error(error);
    return Helper.fail(res, error.message);
  }
};

//for user login
const loginAdmin = async (req, res) => {
  try {
    const { phoneNo } = req.body;
    if (!phoneNo) {
      return Helper.fail(res, "phone number is required");
    }
    const query = {};
    if (phoneNo) {
      query.phoneNo = phoneNo;
    }
    const admin = await AdminModel.findOne({
      $or: [phoneNo ? { phoneNo } : null].filter(
        Boolean
      ),
      isDeleted: false
    });
    if (!admin) {
      return Helper.fail(res, "admin not found, please enter a valid phone number");
    }
    // const otp = generateOTP();
    const newotp = "1234";
    admin.otp = newotp;
    await admin.save();

    // here code for send the otp to user's phone number

    return Helper.success(res, "OTP sent successfull");

  } catch (error) {
    console.log(error);
    return Helper.fail(res, "failed to send OTP");
  }
};

// update admin
const updateAdmin = async (req, res) => {
  try {
    let adminId = req.userId;
    const { profileImage, firstName, lastName, email, phoneNo } =
      req.body;
    if (!adminId) {
      return Helper.fail(res, "adminId is missing from request");
    }
    //validating email
    if (email) {
      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
      if (!emailRegex.test(email)) {
        return Helper.fail(res, "Email is not valid!");
      }
    }
    // Validate mobile if provided
    if (phoneNo) {
      const phoneRegex = /^\d{6,14}$/;
      if (!phoneRegex.test(phoneNo)) {
        return Helper.fail(res, "phoneNo is not valid!");
      }
    }
    let admin = await AdminModel.findById(adminId);
    console.log(admin)
    if (!admin) {
      return Helper.fail(res, "admin not found!");
    }
    let objToUpdate = {};
    if (profileImage) {
      objToUpdate.profileImage = profileImage;
    }
    if (firstName) {
      objToUpdate.firstName = firstName;
    }
    if (lastName) {
      objToUpdate.lastName = lastName;
    }
    if (phoneNo) {
      objToUpdate.phoneNo = phoneNo;
    }
    if (email) {
      const emailRegex = new RegExp(`^${email}$`, "i");
      const admin = await AdminModel.findOne({
        email: emailRegex,
        _id: { $ne: adminId },
      });

      if (admin) {
        return Helper.fail(res, "Email is already used in another account");
      }
      objToUpdate.email = email;
    }
    let updatedProfile = await AdminModel.findByIdAndUpdate(
      adminId,
      objToUpdate,
      {
        new: true,
      }
    );
    if (updatedProfile) {
      return Helper.success(res, "User  updated successfully!", updatedProfile);
    }
  } catch (error) {
    console.log(error);
    return Helper.fail(res, error.message);
  }
};

// soft delete admin
const removeAdmin = async (req, res) => {
  try {
    const { adminId } = req.body;
    if (!adminId) {
      return Helper.fail(res, "Please provide Admin Id ");
    }
    let i = { _id: adminId };
    let deleted = await AdminModel.findOneAndUpdate(
      i,
      { isDeleted: true },
      { new: true }
    );
    if (!deleted) {
      return Helper.fail(res, "No admin found!");
    }
    return Helper.success(res, " Admin deleted successfully", deleted);
  }
  catch (error) {
    console.log(error);
    return Helper.fail(res, error.message);
  }
}

//for fetching admin Profile
const fetchProfile = async (req, res) => {
  try {
    const adminId = req.userId;
    const admin = await AdminModel.findById(adminId).select({ password: 0, __v: 0, createdAt: 0, updatedAt: 0 });
    if (!admin) {
      return Helper.fail(res, "admin not found");
    }
    return Helper.success(res, "Profile fetched successfully", admin);
  } catch (error) {
    console.log(error);
    return Helper.fail(res, "Failed to fetch profile");
  }
};

//for Updating user status by admin
const updateUserStatus = async (req, res) => {
  try {
    const { userId,status } = req.body;

    if (!userId) {
      return Helper.fail(res, "User ID is required");
    }
    const user = await UserModel.findById(userId);

    if (!user) {
      return Helper.fail(res, "User not found");
    }

    user.status = status;
    await user.save();

    return Helper.success(res, "User Status Updated successfully", user);
  } catch (error) {
    console.log(error);
    return Helper.fail(res, "Failed to Update User Status user");
  }
};


module.exports = {
  registerAdmin,
  loginAdmin,
  verifyOTP,
  updateAdmin,
  removeAdmin,
  fetchProfile,
  updateUserStatus

};

