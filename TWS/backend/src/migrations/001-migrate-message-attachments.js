const mongoose = require('mongoose');
const Message = require('../models/Message');
const File = require('../models/File');

/**
 * Migration: Convert legacy message attachments to new File model
 * 
 * This migration:
 * 1. Finds all messages with legacy attachments (filename, url, size, mimeType)
 * 2. Creates File records for each attachment
 * 3. Updates message attachments to reference File IDs
 * 4. Preserves original data for rollback capability
 */

async function up() {
  console.log('Starting migration: Convert legacy message attachments to File model');
  
  try {
    // Find all messages with legacy attachments
    const messagesWithAttachments = await Message.find({
      'attachments.0': { $exists: true },
      'attachments.fileId': { $exists: false } // Only legacy attachments
    });

    console.log(`Found ${messagesWithAttachments.length} messages with legacy attachments`);

    let migratedCount = 0;
    let errorCount = 0;

    for (const message of messagesWithAttachments) {
      try {
        const newAttachments = [];

        for (const attachment of message.attachments) {
          // Skip if already migrated (has fileId)
          if (attachment.fileId) {
            newAttachments.push(attachment);
            continue;
          }

          // Create File record for legacy attachment
          const file = new File({
            chatId: message.chatId,
            uploaderId: message.sender,
            filename: attachment.filename || 'unknown',
            originalName: attachment.filename || 'unknown',
            mimeType: attachment.mimeType || 'application/octet-stream',
            size: attachment.size || 0,
            status: 'ready', // Assume legacy files are ready
            // Store legacy URL in metadata for reference
            metadata: {
              legacyUrl: attachment.url,
              migratedFrom: 'legacy_attachment',
              migratedAt: new Date()
            }
          });

          // Determine file category from mimeType
          if (attachment.mimeType) {
            if (attachment.mimeType.startsWith('image/')) {
              file.metadata.category = 'image';
            } else if (attachment.mimeType.startsWith('video/')) {
              file.metadata.category = 'video';
            } else if (attachment.mimeType.startsWith('audio/')) {
              file.metadata.category = 'audio';
            } else if (attachment.mimeType.includes('pdf') || 
                      attachment.mimeType.includes('document') || 
                      attachment.mimeType.includes('sheet') || 
                      attachment.mimeType.includes('presentation')) {
              file.metadata.category = 'document';
            }
          }

          await file.save();

          // Create new attachment reference
          newAttachments.push({
            type: file.metadata.category || 'file',
            fileId: file._id,
            // Keep legacy fields for backward compatibility
            filename: attachment.filename,
            url: attachment.url,
            size: attachment.size,
            mimeType: attachment.mimeType
          });
        }

        // Update message with new attachments
        await Message.findByIdAndUpdate(message._id, {
          attachments: newAttachments
        });

        migratedCount++;
        
        if (migratedCount % 100 === 0) {
          console.log(`Migrated ${migratedCount} messages...`);
        }

      } catch (error) {
        console.error(`Error migrating message ${message._id}:`, error);
        errorCount++;
      }
    }

    console.log(`Migration completed:`);
    console.log(`- Successfully migrated: ${migratedCount} messages`);
    console.log(`- Errors: ${errorCount} messages`);
    
    return { migratedCount, errorCount };

  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

async function down() {
  console.log('Starting rollback: Restore legacy message attachments');
  
  try {
    // Find all messages with File-based attachments
    const messagesWithFileAttachments = await Message.find({
      'attachments.fileId': { $exists: true }
    });

    console.log(`Found ${messagesWithFileAttachments.length} messages with File attachments`);

    let rolledBackCount = 0;
    let errorCount = 0;

    for (const message of messagesWithFileAttachments) {
      try {
        const legacyAttachments = [];

        for (const attachment of message.attachments) {
          if (attachment.fileId) {
            // Get File record
            const file = await File.findById(attachment.fileId);
            
            if (file && file.metadata && file.metadata.legacyUrl) {
              // Restore legacy format
              legacyAttachments.push({
                filename: file.originalName,
                url: file.metadata.legacyUrl,
                size: file.size,
                mimeType: file.mimeType
              });
              
              // Delete the File record (it was created by migration)
              if (file.metadata.migratedFrom === 'legacy_attachment') {
                await File.findByIdAndDelete(file._id);
              }
            } else {
              // Keep as-is if no legacy data found
              legacyAttachments.push({
                filename: attachment.filename,
                url: attachment.url,
                size: attachment.size,
                mimeType: attachment.mimeType
              });
            }
          } else {
            // Already in legacy format
            legacyAttachments.push(attachment);
          }
        }

        // Update message with legacy attachments
        await Message.findByIdAndUpdate(message._id, {
          attachments: legacyAttachments
        });

        rolledBackCount++;

        if (rolledBackCount % 100 === 0) {
          console.log(`Rolled back ${rolledBackCount} messages...`);
        }

      } catch (error) {
        console.error(`Error rolling back message ${message._id}:`, error);
        errorCount++;
      }
    }

    console.log(`Rollback completed:`);
    console.log(`- Successfully rolled back: ${rolledBackCount} messages`);
    console.log(`- Errors: ${errorCount} messages`);
    
    return { rolledBackCount, errorCount };

  } catch (error) {
    console.error('Rollback failed:', error);
    throw error;
  }
}

// CLI execution
if (require.main === module) {
  const command = process.argv[2];
  
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tws', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  if (command === 'up') {
    up().then((result) => {
      console.log('Migration completed successfully:', result);
      process.exit(0);
    }).catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
  } else if (command === 'down') {
    down().then((result) => {
      console.log('Rollback completed successfully:', result);
      process.exit(0);
    }).catch((error) => {
      console.error('Rollback failed:', error);
      process.exit(1);
    });
  } else {
    console.log('Usage: node 001-migrate-message-attachments.js [up|down]');
    process.exit(1);
  }
}

module.exports = { up, down };
