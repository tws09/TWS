const mongoose = require('mongoose');
const Workspace = require('../models/Workspace');
const PortalUser = require('../models/PortalUser');
const PortalSubscription = require('../models/PortalSubscription');
const Project = require('../models/Project');
const ProjectBoard = require('../models/Board');
const List = require('../models/List');
const Card = require('../models/Card');
const User = require('../models/User');
const Organization = require('../models/Organization');

class PortalMigrationService {
  constructor() {
    this.migrationLog = [];
  }

  log(message) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`);
    this.migrationLog.push(`[${timestamp}] ${message}`);
  }

  async migrateAllData() {
    try {
      this.log('Starting Portal migration...');
      
      // Step 1: Create default organization if it doesn't exist
      await this.createDefaultOrganization();
      
      // Step 2: Migrate existing projects to workspaces
      await this.migrateProjectsToWorkspaces();
      
      // Step 3: Migrate boards and cards
      await this.migrateBoardsAndCards();
      
      // Step 4: Create portal users
      await this.createPortalUsers();
      
      // Step 5: Create subscriptions
      await this.createSubscriptions();
      
      this.log('Portal migration completed successfully!');
      return { success: true, log: this.migrationLog };
      
    } catch (error) {
      this.log(`Migration failed: ${error.message}`);
      return { success: false, error: error.message, log: this.migrationLog };
    }
  }

  async createDefaultOrganization() {
    this.log('Creating default organization...');
    
    let organization = await Organization.findOne({ slug: 'wolfstack' });
    
    if (!organization) {
      organization = new Organization({
        name: 'The Wolf Stack',
        slug: 'wolfstack',
        type: 'company',
        settings: {
          timezone: 'UTC',
          currency: 'USD',
          dateFormat: 'MM/DD/YYYY'
        }
      });
      
      await organization.save();
      this.log('Default organization created');
    } else {
      this.log('Default organization already exists');
    }
    
    return organization;
  }

  async migrateProjectsToWorkspaces() {
    this.log('Migrating projects to workspaces...');
    
    const projects = await Project.find({}).populate('clientId');
    const organization = await Organization.findOne({ slug: 'wolfstack' });
    
    let migratedCount = 0;
    
    for (const project of projects) {
      try {
        // Check if workspace already exists for this project
        const existingWorkspace = await Workspace.findOne({
          'integrations.erpProjectId': project._id
        });
        
        if (existingWorkspace) {
          this.log(`Workspace already exists for project: ${project.name}`);
          continue;
        }
        
        // Generate unique slug
        let slug = project.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        let counter = 1;
        let originalSlug = slug;
        
        while (await Workspace.findOne({ slug, orgId: organization._id })) {
          slug = `${originalSlug}-${counter}`;
          counter++;
        }
        
        // Create workspace
        const workspace = new Workspace({
          orgId: organization._id,
          name: project.name,
          description: project.description,
          slug,
          type: 'client',
          settings: {
            allowMemberInvites: project.settings?.allowClientAccess !== false,
            clientVisible: project.settings?.allowClientAccess !== false,
            autoArchive: project.settings?.autoArchive || false,
            archiveAfterDays: project.settings?.archiveAfterDays || 30,
            requireApproval: project.settings?.requireApproval || false
          },
          integrations: {
            erpSync: true,
            erpProjectId: project._id
          }
        });
        
        await workspace.save();
        
        // Update project with workspace reference
        project.workspaceId = workspace._id;
        project.settings.portalSettings = {
          isPortalProject: true,
          portalVisibility: 'private',
          allowClientPortal: project.settings?.allowClientAccess !== false,
          clientCanCreateCards: false,
          clientCanEditCards: project.settings?.clientCanComment !== false,
          requireClientApproval: project.settings?.clientCanApprove || false,
          autoNotifyClient: true,
          syncWithERP: true
        };
        
        await project.save();
        
        migratedCount++;
        this.log(`Migrated project: ${project.name} -> Workspace: ${workspace.name}`);
        
      } catch (error) {
        this.log(`Error migrating project ${project.name}: ${error.message}`);
      }
    }
    
    this.log(`Migrated ${migratedCount} projects to workspaces`);
  }

  async migrateBoardsAndCards() {
    this.log('Migrating boards and cards...');
    
    const boards = await ProjectBoard.find({}).populate('projectId');
    let migratedBoards = 0;
    let migratedCards = 0;
    
    for (const board of boards) {
      try {
        // Find the workspace for this project
        const workspace = await Workspace.findOne({
          'integrations.erpProjectId': board.projectId._id
        });
        
        if (!workspace) {
          this.log(`No workspace found for board: ${board.name}`);
          continue;
        }
        
        // Update board with workspace reference
        board.workspaceId = workspace._id;
        await board.save();
        
        // Migrate lists
        const lists = await List.find({ boardId: board._id });
        for (const list of lists) {
          list.workspaceId = workspace._id;
          await list.save();
          
          // Migrate cards
          const cards = await Card.find({ listId: list._id });
          for (const card of cards) {
            card.workspaceId = workspace._id;
            await card.save();
            migratedCards++;
          }
        }
        
        migratedBoards++;
        this.log(`Migrated board: ${board.name}`);
        
      } catch (error) {
        this.log(`Error migrating board ${board.name}: ${error.message}`);
      }
    }
    
    this.log(`Migrated ${migratedBoards} boards and ${migratedCards} cards`);
  }

  async createPortalUsers() {
    this.log('Creating portal users...');
    
    const users = await User.find({ status: 'active' });
    const organization = await Organization.findOne({ slug: 'wolfstack' });
    const workspaces = await Workspace.find({ orgId: organization._id });
    
    let createdUsers = 0;
    
    for (const user of users) {
      try {
        // Determine user role based on their system role
        let portalRole = 'member';
        if (['super_admin', 'org_manager'].includes(user.role)) {
          portalRole = 'owner';
        } else if (['pmo', 'project_manager'].includes(user.role)) {
          portalRole = 'admin';
        } else if (['client'].includes(user.role)) {
          portalRole = 'client_viewer';
        }
        
        // Add user to all workspaces
        for (const workspace of workspaces) {
          const existingPortalUser = await PortalUser.findOne({
            userId: user._id,
            workspaceId: workspace._id
          });
          
          if (!existingPortalUser) {
            const portalUser = new PortalUser({
              userId: user._id,
              workspaceId: workspace._id,
              role: portalRole,
              status: 'active',
              joinedAt: new Date()
            });
            
            await portalUser.save();
            createdUsers++;
          }
        }
        
        this.log(`Created portal user: ${user.fullName} (${portalRole})`);
        
      } catch (error) {
        this.log(`Error creating portal user ${user.fullName}: ${error.message}`);
      }
    }
    
    this.log(`Created ${createdUsers} portal user entries`);
  }

  async createSubscriptions() {
    this.log('Creating subscriptions...');
    
    const workspaces = await Workspace.find({});
    let createdSubscriptions = 0;
    
    for (const workspace of workspaces) {
      try {
        const existingSubscription = await PortalSubscription.findOne({
          workspaceId: workspace._id
        });
        
        if (!existingSubscription) {
          const subscription = new PortalSubscription({
            workspaceId: workspace._id,
            plan: 'free',
            status: 'trialing',
            trialStart: new Date(),
            trialEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days free trial
          });
          
          await subscription.save();
          createdSubscriptions++;
        }
        
      } catch (error) {
        this.log(`Error creating subscription for workspace ${workspace.name}: ${error.message}`);
      }
    }
    
    this.log(`Created ${createdSubscriptions} subscriptions`);
  }

  async rollbackMigration() {
    try {
      this.log('Starting migration rollback...');
      
      // Remove workspace references from projects
      await Project.updateMany({}, {
        $unset: { workspaceId: 1 },
        $unset: { 'settings.portalSettings': 1 }
      });
      
      // Remove workspace references from boards
      await ProjectBoard.updateMany({}, { $unset: { workspaceId: 1 } });
      
      // Remove workspace references from lists
      await List.updateMany({}, { $unset: { workspaceId: 1 } });
      
      // Remove workspace references from cards
      await Card.updateMany({}, { $unset: { workspaceId: 1 } });
      
      // Remove portal users
      await PortalUser.deleteMany({});
      
      // Remove subscriptions
      await PortalSubscription.deleteMany({});
      
      // Remove workspaces
      await Workspace.deleteMany({});
      
      this.log('Migration rollback completed');
      return { success: true, log: this.migrationLog };
      
    } catch (error) {
      this.log(`Rollback failed: ${error.message}`);
      return { success: false, error: error.message, log: this.migrationLog };
    }
  }

  async validateMigration() {
    try {
      this.log('Validating migration...');
      
      const validationResults = {
        workspaces: 0,
        portalUsers: 0,
        subscriptions: 0,
        projectsWithWorkspaces: 0,
        boardsWithWorkspaces: 0,
        cardsWithWorkspaces: 0
      };
      
      validationResults.workspaces = await Workspace.countDocuments();
      validationResults.portalUsers = await PortalUser.countDocuments();
      validationResults.subscriptions = await PortalSubscription.countDocuments();
      validationResults.projectsWithWorkspaces = await Project.countDocuments({ workspaceId: { $exists: true } });
      validationResults.boardsWithWorkspaces = await ProjectBoard.countDocuments({ workspaceId: { $exists: true } });
      validationResults.cardsWithWorkspaces = await Card.countDocuments({ workspaceId: { $exists: true } });
      
      this.log('Migration validation results:');
      Object.entries(validationResults).forEach(([key, value]) => {
        this.log(`  ${key}: ${value}`);
      });
      
      return { success: true, results: validationResults, log: this.migrationLog };
      
    } catch (error) {
      this.log(`Validation failed: ${error.message}`);
      return { success: false, error: error.message, log: this.migrationLog };
    }
  }
}

module.exports = PortalMigrationService;
