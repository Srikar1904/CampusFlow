const Notification = require("../models/Notification");
const Admin = require("../models/Admin");
const Faculty = require("../models/Faculty");

// =====================================
// CREATE ONE NOTIFICATION
// =====================================

const createNotification = async ({
  recipientId,
  recipientRole,
  title,
  message,
  type = "system",
  relatedId = null
}) => {
  try {
    return await Notification.create({
      recipientId,
      recipientRole,
      title,
      message,
      type,
      relatedId
    });
  } catch (error) {
    console.error("Notification creation error:", error.message);
    return null;
  }
};


// =====================================
// NOTIFY ALL ADMINS
// =====================================

const notifyAdmins = async ({
  title,
  message,
  type = "system",
  relatedId = null
}) => {
  try {
    const admins = await Admin.find().select("_id");

    await Promise.all(
      admins.map(admin =>
        createNotification({
          recipientId: admin._id,
          recipientRole: "admin",
          title,
          message,
          type,
          relatedId
        })
      )
    );

  } catch (error) {
    console.error("Admin notification error:", error.message);
  }
};


// =====================================
// NOTIFY DEPARTMENT FACULTY
// =====================================

const notifyDepartmentFaculty = async ({
  department,
  title,
  message,
  type = "od",
  relatedId = null
}) => {
  try {
    if (!department) return;

    const faculties = await Faculty.find({
      department: {
        $regex: `^${department.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
        $options: "i"
      },
      isFrozen: false
    }).select("_id");

    await Promise.all(
      faculties.map(faculty =>
        createNotification({
          recipientId: faculty._id,
          recipientRole: "faculty",
          title,
          message,
          type,
          relatedId
        })
      )
    );

  } catch (error) {
    console.error("Faculty notification error:", error.message);
  }
};


module.exports = {
  createNotification,
  notifyAdmins,
  notifyDepartmentFaculty
};