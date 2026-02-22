/**
 * Supra Admin - Department Management routes
 */

const { express, body, validationResult, mongoose } = require('./shared');
const router = express.Router();
const {
  requirePlatformPermission,
  PLATFORM_PERMISSIONS,
  TWSAdmin,
  Department
} = require('./shared');

router.get('/departments', requirePlatformPermission(PLATFORM_PERMISSIONS.TENANTS.READ), async (req, res) => {
  try {
    let departments = await Department.find({ tenantId: null, orgId: null }).populate('parentDepartment', 'name code').sort({ name: 1 }).lean();
    const departmentHeadIds = departments.filter(d => d.departmentHead).map(d => d.departmentHead.toString());
    if (departmentHeadIds.length > 0) {
      const managers = await TWSAdmin.find({ _id: { $in: departmentHeadIds } }).select('fullName email role').lean();
      const managerMap = new Map(managers.map(m => [m._id.toString(), m]));
      departments.forEach(dept => {
        if (dept.departmentHead) {
          const m = managerMap.get(dept.departmentHead.toString());
          dept.departmentHead = m || null;
        }
      });
    }
    const platformAdminDept = departments.find(d => d.name === 'Platform Administration' || d.name === 'Platform Administrator');
    if (!platformAdminDept) {
      try {
        const defaultDept = new Department({ name: 'Platform Administration', code: 'PA', description: 'Platform-level department for Supra Admin users', status: 'active', tenantId: null, orgId: null, createdBy: req.user._id || new mongoose.Types.ObjectId(), defaultPermissions: ['read', 'write', 'admin'] });
        await defaultDept.save();
        departments.unshift(defaultDept.toObject());
      } catch (e) {
        departments.unshift({ _id: 'default-platform-administration', name: 'Platform Administration', code: 'PA', description: 'Platform-level department for Supra Admin users', status: 'active', isPlatformDepartment: true, isDefault: true });
      }
    } else {
      departments = departments.filter(d => d.name !== 'Platform Administration' && d.name !== 'Platform Administrator');
      departments.unshift(platformAdminDept);
    }
    const departmentMap = new Map();
    const rootDepartments = [];
    departments.forEach(dept => departmentMap.set(dept._id.toString(), { ...dept, children: [] }));
    departments.forEach(dept => {
      const deptObj = departmentMap.get(dept._id.toString());
      if (dept.parentDepartment) {
        const parent = departmentMap.get(dept.parentDepartment.toString());
        if (parent) parent.children.push(deptObj);
        else rootDepartments.push(deptObj);
      } else rootDepartments.push(deptObj);
    });
    res.json({ success: true, data: rootDepartments });
  } catch (error) {
    console.error('Error fetching platform departments:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch platform departments' });
  }
});

router.post('/departments', requirePlatformPermission(PLATFORM_PERMISSIONS.TENANTS.CONFIGURE), [
  body('name').notEmpty().withMessage('Department name is required'),
  body('code').notEmpty().withMessage('Department code is required'),
  body('description').optional().isString(),
  body('status').optional().isIn(['active', 'inactive', 'archived']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    const { name, code, description, status, color, managerId, parentId, budget, location, contact, permissions } = req.body;
    const existingDept = await Department.findOne({ code: code.toUpperCase(), tenantId: null, orgId: null });
    if (existingDept) return res.status(400).json({ success: false, message: `Department with code "${code}" already exists` });
    const department = new Department({ name, code: code.toUpperCase(), description: description || '', status: status || 'active', tenantId: null, orgId: null, parentDepartment: parentId || null, departmentHead: managerId || null, departmentHeadModel: managerId ? 'TWSAdmin' : undefined, color: color || '#1890ff', defaultPermissions: permissions || ['read'], createdBy: req.user._id, createdByModel: 'TWSAdmin', metadata: { budget: budget || 0, location: location || '', contact: contact || '' } });
    await department.save();
    res.status(201).json({ success: true, message: 'Platform department created successfully', data: department });
  } catch (error) {
    console.error('Error creating platform department:', error);
    res.status(500).json({ success: false, message: 'Failed to create platform department', error: error.message });
  }
});

router.put('/departments/:id', requirePlatformPermission(PLATFORM_PERMISSIONS.TENANTS.UPDATE), [
  body('name').optional().notEmpty().withMessage('Department name cannot be empty'),
  body('code').optional().notEmpty().withMessage('Department code cannot be empty'),
  body('status').optional().isIn(['active', 'inactive', 'archived']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    const { id } = req.params;
    const updateData = req.body;
    const department = await Department.findOne({ _id: id, tenantId: null, orgId: null });
    if (!department) return res.status(404).json({ success: false, message: 'Platform department not found' });
    if (updateData.code && updateData.code.toUpperCase() !== department.code) {
      const existingDept = await Department.findOne({ code: updateData.code.toUpperCase(), tenantId: null, orgId: null, _id: { $ne: id } });
      if (existingDept) return res.status(400).json({ success: false, message: `Department with code "${updateData.code}" already exists` });
      updateData.code = updateData.code.toUpperCase();
    }
    Object.assign(department, updateData);
    if (updateData.managerId) { department.departmentHead = updateData.managerId; department.departmentHeadModel = 'TWSAdmin'; }
    if (updateData.parentId !== undefined) department.parentDepartment = updateData.parentId || null;
    if (updateData.permissions) department.defaultPermissions = updateData.permissions;
    if (updateData.budget !== undefined || updateData.location || updateData.contact) {
      department.metadata = { ...department.metadata, budget: updateData.budget !== undefined ? updateData.budget : department.metadata?.budget || 0, location: updateData.location || department.metadata?.location || '', contact: updateData.contact || department.metadata?.contact || '' };
    }
    await department.save();
    res.json({ success: true, message: 'Platform department updated successfully', data: department });
  } catch (error) {
    console.error('Error updating platform department:', error);
    res.status(500).json({ success: false, message: 'Failed to update platform department', error: error.message });
  }
});

router.delete('/departments/:id', requirePlatformPermission(PLATFORM_PERMISSIONS.TENANTS.DELETE), async (req, res) => {
  try {
    const department = await Department.findOne({ _id: req.params.id, tenantId: null, orgId: null });
    if (!department) return res.status(404).json({ success: false, message: 'Platform department not found' });
    if (department.name === 'Platform Administration' || department.name === 'Platform Administrator') return res.status(400).json({ success: false, message: 'Cannot delete "Platform Administration" department.' });
    const usersWithDept = await TWSAdmin.countDocuments({ department: department.name, status: 'active' });
    if (usersWithDept > 0) return res.status(400).json({ success: false, message: `Cannot delete department. ${usersWithDept} active platform admin(s) are assigned. Please reassign them first.` });
    await Department.deleteOne({ _id: req.params.id });
    res.json({ success: true, message: 'Platform department deleted successfully' });
  } catch (error) {
    console.error('Error deleting platform department:', error);
    res.status(500).json({ success: false, message: 'Failed to delete platform department', error: error.message });
  }
});

router.get('/tenant-departments', requirePlatformPermission(PLATFORM_PERMISSIONS.TENANTS.READ), async (req, res) => {
  try {
    res.json({ success: true, data: [], message: 'Platform departments are not assigned to tenants. Tenant departments are managed within each tenant\'s ERP system.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch tenant-departments' });
  }
});

router.post('/tenant-departments', requirePlatformPermission(PLATFORM_PERMISSIONS.TENANTS.CONFIGURE), async (req, res) => {
  try {
    return res.status(400).json({ success: false, message: 'Platform departments cannot be assigned to tenants. Tenant departments are managed within each tenant\'s ERP system.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to assign departments' });
  }
});

router.delete('/tenant-departments/:tenantId/:departmentId', requirePlatformPermission(PLATFORM_PERMISSIONS.TENANTS.UPDATE), async (req, res) => {
  try {
    return res.status(400).json({ success: false, message: 'Platform departments are not assigned to tenants. Tenant departments are managed within each tenant\'s ERP system.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to remove department' });
  }
});

module.exports = router;
