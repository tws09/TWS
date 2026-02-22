/**
 * Seed tasks and milestones for the "muhammad subhan" project in sufyan@gmail.com's tenant.
 * Use so Calendar, Gantt, Timeline, and Table views show data.
 *
 * Usage (from backend folder):
 *   node scripts/seed-project-muhammad-subhan.js
 *   node scripts/seed-project-muhammad-subhan.js --project-id=<id>
 *   node scripts/seed-project-muhammad-subhan.js --email=other@example.com
 *
 * Requires MONGO_URI or MONGODB_URI in .env.
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const path = require('path');
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || process.env.DATABASE_URL || 'mongodb://localhost:27017/tws';
const TENANT_USER_EMAIL = 'sufyan@gmail.com';

async function main() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected.\n');

    const Project = require(path.join(__dirname, '../src/models/Project'));
    const Task = require(path.join(__dirname, '../src/models/Task'));
    const Department = require(path.join(__dirname, '../src/models/Department'));
    const User = require(path.join(__dirname, '../src/models/User'));
    const Milestone = require(path.join(__dirname, '../src/models/Milestone'));
    const Organization = require(path.join(__dirname, '../src/models/Organization'));
    const Tenant = require(path.join(__dirname, '../src/models/Tenant'));

    const emailArg = process.argv.find(a => a.startsWith('--email='));
    const tenantUserEmail = emailArg ? emailArg.split('=')[1] : TENANT_USER_EMAIL;

    const tenantUser = await User.findOne({ email: tenantUserEmail.toLowerCase().trim() }).select('_id orgId').lean();
    if (!tenantUser) {
      console.error('No user found with email:', tenantUserEmail, '- Create that user first in the tenant org.');
      process.exit(1);
    }
    const orgId = tenantUser.orgId;
    if (!orgId) {
      console.error('User', tenantUserEmail, 'has no orgId.');
      process.exit(1);
    }
    console.log('Tenant context: user', tenantUserEmail, 'orgId', orgId.toString());

    let tenantId = null;
    const org = await Organization.findById(orgId).select('tenantId slug').lean();
    if (org?.tenantId) {
      const id = org.tenantId;
      if (mongoose.Types.ObjectId.isValid(id) && String(id).length === 24) {
        tenantId = id;
      } else {
        const t = await Tenant.findOne({ $or: [{ slug: id }, { tenantId: id }] }).select('_id').lean();
        if (t) tenantId = t._id;
      }
    }
    if (!tenantId) {
      const tenantByOrg = await Tenant.findOne({ organizationId: orgId }).select('_id').lean();
      if (tenantByOrg) tenantId = tenantByOrg._id;
    }
    if (!tenantId && org?.slug) {
      const tenantBySlug = await Tenant.findOne({ slug: org.slug }).select('_id').lean();
      if (tenantBySlug) tenantId = tenantBySlug._id;
    }
    if (!tenantId) {
      const tenantByEmail = await Tenant.findOne({ 'contactInfo.email': tenantUserEmail }).select('_id').lean();
      if (tenantByEmail) tenantId = tenantByEmail._id;
    }
    if (!tenantId) {
      console.error('No tenant linked to this org. Link the organization to a tenant (Organization.tenantId or Tenant.organizationId), or ensure Tenant.slug matches Organization.slug.');
      process.exit(1);
    }
    console.log('Resolved tenantId:', tenantId.toString());

    let project;
    const projectIdArg = process.argv.find(a => a.startsWith('--project-id='));
    if (projectIdArg) {
      const id = projectIdArg.split('=')[1];
      project = await Project.findOne({ _id: id, orgId }).lean();
      if (!project) {
        console.error('Project not found for id:', id, 'in this tenant org.');
        process.exit(1);
      }
    } else {
      const projects = await Project.find({
        orgId,
        name: { $regex: /muhammad\s*subhan/i }
      }).lean();
      if (!projects.length) {
        console.log('No project named "muhammad subhan" found in this tenant. Listing projects in org:');
        const recent = await Project.find({ orgId }).sort({ updatedAt: -1 }).limit(5).select('name _id orgId').lean();
        recent.forEach(p => console.log('  -', p.name, p._id.toString()));
        console.log('\nRun with --project-id=<id> to seed a specific project.');
        process.exit(0);
      }
      project = projects[0];
      console.log('Using project:', project.name, '(' + project._id + ')');
    }

    if (project.orgId.toString() !== orgId.toString()) {
      console.error('Project does not belong to tenant org.');
      process.exit(1);
    }

    let departmentId = project.primaryDepartmentId || (project.departments && project.departments[0]);
    if (!departmentId) {
      let dept = await Department.findOne({ orgId }).select('_id').lean();
      if (!dept) {
        dept = await Department.create({
          orgId,
          name: 'General',
          code: 'GEN',
          description: 'Default department for seeding',
        });
        console.log('Created default department "General" for org.');
      }
      departmentId = dept._id;
    }

    const reporter = await User.findOne({ orgId }).select('_id').lean();
    if (!reporter) {
      console.error('No user found for org. Create a user in this org first.');
      process.exit(1);
    }

    const now = new Date();
    const addDays = (d, n) => {
      const x = new Date(d);
      x.setDate(x.getDate() + n);
      return x;
    };

    const taskTemplates = [
      { title: 'Requirements & scope', status: 'completed', startOffset: -14, durationDays: 5, progress: 100 },
      { title: 'Architecture & tech design', status: 'completed', startOffset: -9, durationDays: 4, progress: 100 },
      { title: 'Sprint 1 – Core API', status: 'in_progress', startOffset: -5, durationDays: 10, progress: 60 },
      { title: 'Sprint 2 – Frontend shell', status: 'todo', startOffset: 2, durationDays: 10, progress: 0 },
      { title: 'Integration & APIs', status: 'todo', startOffset: 8, durationDays: 7, progress: 0 },
      { title: 'QA & UAT', status: 'todo', startOffset: 18, durationDays: 7, progress: 0 },
      { title: 'Deploy to staging', status: 'todo', startOffset: 24, durationDays: 2, progress: 0 },
      { title: 'Documentation & handoff', status: 'todo', startOffset: 22, durationDays: 5, progress: 0 },
    ];

    const createdTasks = [];
    for (let i = 0; i < taskTemplates.length; i++) {
      const t = taskTemplates[i];
      const startDate = addDays(now, t.startOffset);
      const dueDate = addDays(startDate, t.durationDays);
      const task = await Task.create({
        orgId,
        projectId: project._id,
        departmentId,
        reporter: reporter._id,
        tenantId,
        taskId: `seed-${project._id}-${i}-${new mongoose.Types.ObjectId().toString()}`,
        title: t.title,
        status: t.status,
        priority: 'medium',
        startDate,
        dueDate,
        progress: t.progress ?? 0,
        estimatedHours: t.durationDays * 6,
      });
      createdTasks.push(task);
    }
    console.log('Created', createdTasks.length, 'tasks.');

    const milestoneTemplates = [
      { title: 'Design sign-off', daysOffset: -6 },
      { title: 'Sprint 1 complete', daysOffset: 5 },
      { title: 'Release to staging', daysOffset: 26 },
    ];
    for (const m of milestoneTemplates) {
      await Milestone.create({
        orgId,
        projectId: project._id,
        title: m.title,
        dueDate: addDays(now, m.daysOffset),
        status: m.daysOffset <= 0 ? 'completed' : 'pending',
        progress: m.daysOffset <= 0 ? 100 : 0,
      });
    }
    console.log('Created', milestoneTemplates.length, 'milestones.');

    console.log('\nDone. Open Calendar / Gantt / Timeline / Table for project', project._id);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected.');
  }
}

main();
