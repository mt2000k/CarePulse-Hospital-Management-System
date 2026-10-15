const Department = require('../models/Department');
const Doctor = require('../models/Doctor');

// @desc    Get all departments
// @route   GET /api/departments
// @access  Public
const getDepartments = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    let query = {};

    if (status) {
      query.status = status;
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const departments = await Department.find(query).sort({ name: 1 });

    // Count doctors in each department
    const departmentsWithDoctorCount = await Promise.all(
      departments.map(async (dept) => {
        const doctorCount = await Doctor.countDocuments({
          departmentId: dept._id,
          status: 'active'
        });
        return {
          ...dept.toObject(),
          doctorCount
        };
      })
    );

    res.status(200).json({
      success: true,
      count: departmentsWithDoctorCount.length,
      data: departmentsWithDoctorCount
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get department by ID
// @route   GET /api/departments/:id
// @access  Public
const getDepartmentById = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    // Get active doctors in this department
    const doctors = await Doctor.find({ departmentId: department._id, status: 'active' })
      .populate('userId', 'name email phone avatar')
      .sort({ experience: -1 });

    res.status(200).json({
      success: true,
      data: {
        department,
        doctors
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new department
// @route   POST /api/departments
// @access  Private/Admin
const createDepartment = async (req, res, next) => {
  try {
    const { name, description, image, status } = req.body;

    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: 'Department name and description are required'
      });
    }

    const existingDept = await Department.findOne({ name: { $regex: `^${name.trim()}$`, $options: 'i' } });
    if (existingDept) {
      return res.status(400).json({
        success: false,
        message: 'Department with this name already exists'
      });
    }

    const department = await Department.create({
      name,
      description,
      image: image || '',
      status: status || 'active'
    });

    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      data: department
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update department
// @route   PUT /api/departments/:id
// @access  Private/Admin
const updateDepartment = async (req, res, next) => {
  try {
    const { name, description, image, status } = req.body;

    let department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    if (name && name !== department.name) {
      const existingDept = await Department.findOne({ name: { $regex: `^${name.trim()}$`, $options: 'i' } });
      if (existingDept) {
        return res.status(400).json({
          success: false,
          message: 'Another department with this name already exists'
        });
      }
      department.name = name;
    }

    if (description !== undefined) department.description = description;
    if (image !== undefined) department.image = image;
    if (status !== undefined) department.status = status;

    await department.save();

    res.status(200).json({
      success: true,
      message: 'Department updated successfully',
      data: department
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete/Deactivate department
// @route   DELETE /api/departments/:id
// @access  Private/Admin
const deleteDepartment = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    // Check if doctors belong to this department
    const doctorCount = await Doctor.countDocuments({ departmentId: department._id });
    if (doctorCount > 0) {
      // Soft delete by setting status to inactive
      department.status = 'inactive';
      await department.save();
      return res.status(200).json({
        success: true,
        message: 'Department has assigned doctors and was deactivated rather than hard deleted',
        data: department
      });
    }

    await department.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Department deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment
};
