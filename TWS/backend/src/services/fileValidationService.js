const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const auditService = require('./compliance/audit.service');

/**
 * Enhanced File Validation Service
 * Provides comprehensive file validation beyond MIME type checking
 */
class FileValidationService {
  constructor() {
    this.allowedMimeTypes = {
      // Images
      'image/jpeg': { extensions: ['.jpg', '.jpeg'], maxSize: 10 * 1024 * 1024 }, // 10MB
      'image/png': { extensions: ['.png'], maxSize: 10 * 1024 * 1024 },
      'image/gif': { extensions: ['.gif'], maxSize: 5 * 1024 * 1024 }, // 5MB
      'image/webp': { extensions: ['.webp'], maxSize: 10 * 1024 * 1024 },
      'image/svg+xml': { extensions: ['.svg'], maxSize: 1 * 1024 * 1024 }, // 1MB
      
      // Documents
      'application/pdf': { extensions: ['.pdf'], maxSize: 50 * 1024 * 1024 }, // 50MB
      'application/msword': { extensions: ['.doc'], maxSize: 25 * 1024 * 1024 },
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { extensions: ['.docx'], maxSize: 25 * 1024 * 1024 },
      'application/vnd.ms-excel': { extensions: ['.xls'], maxSize: 25 * 1024 * 1024 },
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { extensions: ['.xlsx'], maxSize: 25 * 1024 * 1024 },
      'application/vnd.ms-powerpoint': { extensions: ['.ppt'], maxSize: 25 * 1024 * 1024 },
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': { extensions: ['.pptx'], maxSize: 25 * 1024 * 1024 },
      'text/plain': { extensions: ['.txt'], maxSize: 1 * 1024 * 1024 },
      'text/csv': { extensions: ['.csv'], maxSize: 5 * 1024 * 1024 },
      
      // Archives
      'application/zip': { extensions: ['.zip'], maxSize: 100 * 1024 * 1024 }, // 100MB
      'application/x-rar-compressed': { extensions: ['.rar'], maxSize: 100 * 1024 * 1024 },
      'application/x-7z-compressed': { extensions: ['.7z'], maxSize: 100 * 1024 * 1024 },
      'application/gzip': { extensions: ['.gz'], maxSize: 100 * 1024 * 1024 },
      
      // Audio
      'audio/mpeg': { extensions: ['.mp3'], maxSize: 50 * 1024 * 1024 },
      'audio/wav': { extensions: ['.wav'], maxSize: 50 * 1024 * 1024 },
      'audio/ogg': { extensions: ['.ogg'], maxSize: 50 * 1024 * 1024 },
      'audio/mp4': { extensions: ['.m4a'], maxSize: 50 * 1024 * 1024 },
      
      // Video
      'video/mp4': { extensions: ['.mp4'], maxSize: 200 * 1024 * 1024 }, // 200MB
      'video/avi': { extensions: ['.avi'], maxSize: 200 * 1024 * 1024 },
      'video/mov': { extensions: ['.mov'], maxSize: 200 * 1024 * 1024 },
      'video/wmv': { extensions: ['.wmv'], maxSize: 200 * 1024 * 1024 },
      'video/webm': { extensions: ['.webm'], maxSize: 200 * 1024 * 1024 }
    };

    this.dangerousExtensions = [
      '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jar',
      '.php', '.asp', '.aspx', '.jsp', '.py', '.rb', '.pl', '.sh', '.ps1',
      '.dll', '.sys', '.drv', '.msi', '.deb', '.rpm', '.app', '.dmg'
    ];

    this.magicNumbers = {
      // Images
      'image/jpeg': ['FFD8FF'],
      'image/png': ['89504E47'],
      'image/gif': ['47494638'],
      'image/webp': ['52494646'],
      'image/svg+xml': ['3C737667', '3C3F786D6C'],
      
      // Documents
      'application/pdf': ['25504446'],
      'application/msword': ['D0CF11E0A1B11AE1'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['504B0304'],
      'application/vnd.ms-excel': ['D0CF11E0A1B11AE1'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['504B0304'],
      'application/vnd.ms-powerpoint': ['D0CF11E0A1B11AE1'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['504B0304'],
      
      // Archives
      'application/zip': ['504B0304', '504B0506', '504B0708'],
      'application/x-rar-compressed': ['526172211A0700', '526172211A070100'],
      'application/x-7z-compressed': ['377ABCAF271C'],
      'application/gzip': ['1F8B08'],
      
      // Audio
      'audio/mpeg': ['FFFB', 'FFF3', 'FFF2'],
      'audio/wav': ['52494646'],
      'audio/ogg': ['4F676753'],
      'audio/mp4': ['00000018667479704D344120'],
      
      // Video
      'video/mp4': ['00000018667479706D703432', '00000020667479706D703432'],
      'video/avi': ['52494646'],
      'video/mov': ['000000146674797071742020'],
      'video/webm': ['1A45DFA3']
    };
  }

  /**
   * Validate file upload
   */
  async validateFile(file, options = {}) {
    const {
      allowedTypes = Object.keys(this.allowedMimeTypes),
      maxSize = 50 * 1024 * 1024, // 50MB default
      scanForMalware = true,
      generateThumbnail = false
    } = options;

    const validation = {
      valid: false,
      errors: [],
      warnings: [],
      fileInfo: {}
    };

    try {
      // 1. Basic file validation
      const basicValidation = this.validateBasicFile(file);
      if (!basicValidation.valid) {
        validation.errors.push(...basicValidation.errors);
        return validation;
      }

      // 2. File extension validation
      const extensionValidation = this.validateFileExtension(file.originalname);
      if (!extensionValidation.valid) {
        validation.errors.push(...extensionValidation.errors);
        return validation;
      }

      // 3. MIME type validation
      const mimeValidation = this.validateMimeType(file.mimetype, allowedTypes);
      if (!mimeValidation.valid) {
        validation.errors.push(...mimeValidation.errors);
        return validation;
      }

      // 4. File size validation
      const sizeValidation = this.validateFileSize(file.size, file.mimetype, maxSize);
      if (!sizeValidation.valid) {
        validation.errors.push(...sizeValidation.errors);
        return validation;
      }

      // 5. Magic number validation (file signature)
      const magicValidation = await this.validateMagicNumber(file.buffer, file.mimetype);
      if (!magicValidation.valid) {
        validation.errors.push(...magicValidation.errors);
        return validation;
      }

      // 6. Content validation
      const contentValidation = await this.validateFileContent(file, file.mimetype);
      if (!contentValidation.valid) {
        validation.errors.push(...contentValidation.errors);
        return validation;
      }

      // 7. Generate file info
      validation.fileInfo = await this.generateFileInfo(file, generateThumbnail);

      // 8. Security scan
      if (scanForMalware) {
        const securityScan = await this.performSecurityScan(file);
        if (!securityScan.valid) {
          validation.errors.push(...securityScan.errors);
          return validation;
        }
        validation.warnings.push(...securityScan.warnings);
      }

      validation.valid = true;
      return validation;

    } catch (error) {
      console.error('File validation error:', error);
      validation.errors.push('File validation failed');
      return validation;
    }
  }

  /**
   * Basic file validation
   */
  validateBasicFile(file) {
    const errors = [];

    if (!file) {
      errors.push('No file provided');
      return { valid: false, errors };
    }

    if (!file.originalname || file.originalname.trim() === '') {
      errors.push('File name is required');
    }

    if (!file.mimetype) {
      errors.push('File type is required');
    }

    if (!file.buffer || file.buffer.length === 0) {
      errors.push('File content is empty');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate file extension
   */
  validateFileExtension(filename) {
    const errors = [];
    const extension = path.extname(filename).toLowerCase();

    if (!extension) {
      errors.push('File must have an extension');
      return { valid: false, errors };
    }

    if (this.dangerousExtensions.includes(extension)) {
      errors.push(`File type ${extension} is not allowed for security reasons`);
      return { valid: false, errors };
    }

    return { valid: true, errors: [] };
  }

  /**
   * Validate MIME type
   */
  validateMimeType(mimetype, allowedTypes) {
    const errors = [];

    if (!mimetype) {
      errors.push('MIME type is required');
      return { valid: false, errors };
    }

    if (!allowedTypes.includes(mimetype)) {
      errors.push(`File type ${mimetype} is not allowed`);
      return { valid: false, errors };
    }

    return { valid: true, errors: [] };
  }

  /**
   * Validate file size
   */
  validateFileSize(size, mimetype, maxSize) {
    const errors = [];

    if (size <= 0) {
      errors.push('File size must be greater than 0');
      return { valid: false, errors };
    }

    const typeConfig = this.allowedMimeTypes[mimetype];
    const typeMaxSize = typeConfig ? typeConfig.maxSize : maxSize;
    const effectiveMaxSize = Math.min(maxSize, typeMaxSize);

    if (size > effectiveMaxSize) {
      errors.push(`File size ${this.formatBytes(size)} exceeds maximum allowed size ${this.formatBytes(effectiveMaxSize)}`);
      return { valid: false, errors };
    }

    return { valid: true, errors: [] };
  }

  /**
   * Validate magic number (file signature)
   */
  async validateMagicNumber(buffer, mimetype) {
    const errors = [];

    if (!buffer || buffer.length < 4) {
      errors.push('File is too small to validate');
      return { valid: false, errors };
    }

    const magicNumbers = this.magicNumbers[mimetype];
    if (!magicNumbers) {
      return { valid: true, errors: [] }; // No magic number validation for this type
    }

    const fileSignature = buffer.slice(0, 16).toString('hex').toUpperCase();
    const isValidSignature = magicNumbers.some(magic => 
      fileSignature.startsWith(magic.toUpperCase())
    );

    if (!isValidSignature) {
      errors.push(`File signature does not match expected type ${mimetype}`);
      return { valid: false, errors };
    }

    return { valid: true, errors: [] };
  }

  /**
   * Validate file content
   */
  async validateFileContent(file, mimetype) {
    const errors = [];

    try {
      if (mimetype.startsWith('image/')) {
        const imageValidation = await this.validateImageContent(file.buffer);
        if (!imageValidation.valid) {
          errors.push(...imageValidation.errors);
        }
      } else if (mimetype === 'application/pdf') {
        const pdfValidation = await this.validatePDFContent(file.buffer);
        if (!pdfValidation.valid) {
          errors.push(...pdfValidation.errors);
        }
      } else if (mimetype.startsWith('text/')) {
        const textValidation = this.validateTextContent(file.buffer);
        if (!textValidation.valid) {
          errors.push(...textValidation.errors);
        }
      }
    } catch (error) {
      errors.push('Failed to validate file content');
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Validate image content
   */
  async validateImageContent(buffer) {
    const errors = [];

    try {
      const metadata = await sharp(buffer).metadata();
      
      if (!metadata.width || !metadata.height) {
        errors.push('Invalid image dimensions');
      }

      if (metadata.width > 10000 || metadata.height > 10000) {
        errors.push('Image dimensions too large');
      }

      // Check for suspicious image properties
      if (metadata.density && metadata.density > 300) {
        errors.push('Image density too high');
      }

    } catch (error) {
      errors.push('Invalid image format');
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Validate PDF content
   */
  async validatePDFContent(buffer) {
    const errors = [];

    try {
      const content = buffer.toString('utf8', 0, Math.min(1024, buffer.length));
      
      // Check for suspicious PDF content
      if (content.includes('/JavaScript') || content.includes('/JS')) {
        errors.push('PDF contains JavaScript which is not allowed');
      }

      if (content.includes('/Launch') || content.includes('/GoToR')) {
        errors.push('PDF contains potentially dangerous actions');
      }

    } catch (error) {
      errors.push('Failed to validate PDF content');
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Validate text content
   */
  validateTextContent(buffer) {
    const errors = [];

    try {
      const content = buffer.toString('utf8');
      
      // Check for suspicious patterns
      const suspiciousPatterns = [
        /<script[^>]*>/i,
        /javascript:/i,
        /vbscript:/i,
        /onload\s*=/i,
        /onerror\s*=/i
      ];

      for (const pattern of suspiciousPatterns) {
        if (pattern.test(content)) {
          errors.push('Text file contains potentially malicious content');
          break;
        }
      }

    } catch (error) {
      errors.push('Failed to validate text content');
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Generate file information
   */
  async generateFileInfo(file, generateThumbnail = false) {
    const info = {
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      extension: path.extname(file.originalname).toLowerCase(),
      hash: crypto.createHash('sha256').update(file.buffer).digest('hex'),
      uploadedAt: new Date()
    };

    // Generate thumbnail for images
    if (generateThumbnail && file.mimetype.startsWith('image/')) {
      try {
        const thumbnail = await sharp(file.buffer)
          .resize(200, 200, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 80 })
          .toBuffer();
        
        info.thumbnail = {
          data: thumbnail,
          size: thumbnail.length,
          format: 'jpeg'
        };
      } catch (error) {
        console.error('Failed to generate thumbnail:', error);
      }
    }

    return info;
  }

  /**
   * Perform security scan
   */
  async performSecurityScan(file) {
    const errors = [];
    const warnings = [];

    try {
      // Check for embedded files in archives
      if (file.mimetype.includes('zip') || file.mimetype.includes('rar')) {
        warnings.push('Archive files may contain embedded files that will be scanned separately');
      }

      // Check for executable content
      const content = file.buffer.toString('utf8', 0, Math.min(1024, file.buffer.length));
      if (content.includes('MZ') || content.includes('PE')) {
        errors.push('File appears to contain executable content');
      }

      // Check for suspicious file names
      if (file.originalname.includes('..') || file.originalname.includes('/') || file.originalname.includes('\\')) {
        errors.push('File name contains suspicious characters');
      }

    } catch (error) {
      errors.push('Security scan failed');
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  /**
   * Format bytes to human readable string
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Get allowed file types
   */
  getAllowedTypes() {
    return Object.keys(this.allowedMimeTypes);
  }

  /**
   * Get file type configuration
   */
  getFileTypeConfig(mimetype) {
    return this.allowedMimeTypes[mimetype];
  }
}

// Create singleton instance
const fileValidationService = new FileValidationService();

module.exports = fileValidationService;
