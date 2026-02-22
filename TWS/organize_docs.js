const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();
const targetBase = path.join(rootDir, 'docs', 'development-history');

// Define categories and their target folders
const categories = [
    {
        target: '01-planning-and-specs',
        patterns: [/PLAN/i, /PROPOSAL/i, /SRS/i, /REQUIREMENT/i, /GUIDE/i, /CHECKLIST/i]
    },
    {
        target: '02-architecture',
        patterns: [/ARCHITECTURE/i, /ANALYSIS/i, /STRUCTURE/i, /AUDIT/i, /REVIEW/i, /DATABASE/i, /DIAGRAM/i, /MAPPING/i]
    },
    {
        target: '03-milestones',
        patterns: [/MILESTONE/i, /PHASE/i, /ROADMAP/i, /NEXT_STEPS/i]
    },
    {
        target: '04-features/auth',
        patterns: [/LOGIN/i, /AUTH/i, /SIGNUP/i, /PASSWORD/i, /ACCESS/i]
    },
    {
        target: '04-features/tenant',
        patterns: [/TENANT/i, /PORTAL/i, /ORG/i, /MULTI/i]
    },
    {
        target: '04-features/finance',
        patterns: [/FINANCE/i, /PAYROLL/i, /EQUITY/i, /CAP_TABLE/i]
    },
    {
        target: '04-features/erp-domains',
        patterns: [/EDUCATION/i, /SCHOOL/i, /HEALTHCARE/i, /INDUSTRY/i]
    },
    {
        target: '04-features/ui-ux',
        patterns: [/NAVBAR/i, /UI/i, /UX/i, /ANIMATION/i, /PWA/i, /ICON/i, /MENU/i, /TYPEWRITER/i]
    },
    {
        target: '04-features/admin',
        patterns: [/ADMIN/i, /SUPRA/i, /GTS/i]
    },
    {
        target: '05-debugging-and-fixes',
        patterns: [/FIX/i, /ERROR/i, /DEBUG/i, /ISSUE/i, /CORRECTION/i, /RECOVERY/i, /FAIL/i, /BUG/i, /GLITCH/i, /TROUBLESHOOT/i]
    },
    {
        target: '06-status-reports',
        patterns: [/STATUS/i, /REPORT/i, /SUMMARY/i, /COMPLETE/i, /SUCCESS/i, /UPDATE/i]
    }
];

// Files to EXCLUDE from moving
const excludeFiles = [
    'README.md',
    'README_WEBSITE.md',
    'README_STARTUP.md',
    'package.json',
    'package-lock.json',
    '.gitignore',
    '.env',
    '.env.local',
    '.env.production',
    '.env.development',
    'FOLDER_ORGANIZATION_STRATEGY.md',
    'organize_docs.js',
    'PRODUCTION_READINESS_AUDIT.md',
    'PROJECT_STRUCTURE_PROFESSIONAL_AUDIT.md'
];

// Get all files in root
fs.readdir(rootDir, (err, files) => {
    if (err) {
        console.error('Error reading directory:', err);
        return;
    }

    let movedCount = 0;

    files.forEach(file => {
        // Only process .md files
        if (!file.endsWith('.md')) return;

        // Skip excluded files
        if (excludeFiles.includes(file)) return;

        const filePath = path.join(rootDir, file);

        // Determine target folder
        let targetFolder = null;

        // Try to match patterns (priority order matters)
        for (const category of categories) {
            for (const pattern of category.patterns) {
                if (pattern.test(file)) {
                    targetFolder = path.join(targetBase, category.target);
                    break;
                }
            }
            if (targetFolder) break;
        }

        // Default fallback if no match (put in planning or status depending on name, or a 'misc' folder)
        // For now, let's put unmatched MD files in '06-status-reports' if they look like logs, or '01-planning' if generic
        if (!targetFolder) {
            targetFolder = path.join(targetBase, '06-status-reports'); // Fallback
        }

        // Move the file
        const targetPath = path.join(targetFolder, file);

        // Ensure target directory exists
        if (!fs.existsSync(targetFolder)) {
            fs.mkdirSync(targetFolder, { recursive: true });
        }

        try {
            fs.renameSync(filePath, targetPath);
            console.log(`Moved: ${file} -> ${categoryName(targetFolder)}`);
            movedCount++;
        } catch (moveErr) {
            console.error(`Failed to move ${file}:`, moveErr);
        }
    });

    console.log(`\n✅ Successfully moved ${movedCount} files.`);
});

function categoryName(pathStr) {
    return pathStr.split('development-history')[1] || pathStr;
}
