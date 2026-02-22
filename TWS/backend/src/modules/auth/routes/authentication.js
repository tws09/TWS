const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');
const { generateTokens, authenticateToken, setAuthCookies, clearAuthCookies } = require('../../../middleware/auth/auth');
const ErrorHandler = require('../../../middleware/common/errorHandler');
const { authLimiter, registrationLimiter, passwordResetLimiter, tokenRefreshLimiter, strictLimiter } = require('../../../middleware/rateLimiting/rateLimiter');
const { setSecureCookie, setRefreshTokenCookie, clearSecureCookie } = require('../../../middleware/security/cookieSecurity');

// Validation handler - standalone implementation
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

const User = require('../../../models/User');
const Organization = require('../../../models/Organization');
const TWSAdmin = require('../../../models/TWSAdmin');

const router = express.Router();

// Middleware to check if database is connected
const checkDatabaseConnection = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: 'Database connection not ready. Please try again in a moment.'
    });
  }
  next();
};

// DEBUG: Check all required functions before defining routes
console.log('🔍 DEBUG: Checking middleware functions...');
console.log('ErrorHandler:', typeof ErrorHandler);
console.log('ErrorHandler.asyncHandler:', typeof ErrorHandler?.asyncHandler);
console.log('handleValidationErrors:', typeof handleValidationErrors);
console.log('checkDatabaseConnection:', typeof checkDatabaseConnection);
console.log('body:', typeof body);

// DEBUG: Verify all functions are defined before route definition
if (!ErrorHandler || !ErrorHandler.asyncHandler) {
  throw new Error('❌ CRITICAL: ErrorHandler.asyncHandler is undefined!');
}
if (typeof handleValidationErrors !== 'function') {
  throw new Error('❌ CRITICAL: handleValidationErrors is not a function!');
}
if (typeof checkDatabaseConnection !== 'function') {
  throw new Error('❌ CRITICAL: checkDatabaseConnection is not a function!');
}

// Register
console.log('📝 Defining /register route...');
router.post('/register', 
  registrationLimiter, // SECURITY: Rate limiting (3 registrations per hour per IP)
  checkDatabaseConnection,
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('fullName').notEmpty().trim(),
  body('role').optional().isIn(['super_admin', 'org_manager', 'pmo', 'project_manager', 'department_lead', 'contributor', 'client', 'reseller', 'owner', 'admin', 'hr', 'finance', 'manager', 'employee', 'contractor', 'auditor']),
  handleValidationErrors,
  ErrorHandler.asyncHandler(async (req, res) => {
  const { email, password, fullName, role = 'contributor' } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'User already exists'
    });
  }

  // Get default organization (for now, assign all users to the default org)
  const organization = await Organization.findOne({ slug: 'wolfstack' });
  if (!organization) {
    return res.status(500).json({
      success: false,
      message: 'Default organization not found. Please contact administrator.'
    });
  }

  // Create user
  const user = new User({
    email,
    password,
    fullName,
    role,
    orgId: organization._id
  });

  await user.save();

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user._id);

  // Store refresh token
  user.refreshTokens.push({ token: refreshToken });
  await user.save();

  // SECURITY FIX: Set HttpOnly cookies instead of returning tokens in response
  setSecureCookie(res, 'accessToken', accessToken, { maxAge: 15 * 60 * 1000 }); // 15 minutes
  setRefreshTokenCookie(res, 'refreshToken', refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000 }); // 30 days

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: user.toJSON()
      // Tokens are now in HttpOnly cookies, not in response body
    }
  });
}));

// Login
router.post('/login',
  authLimiter, // SECURITY: Rate limiting (5 login attempts per 15 minutes per IP)
  checkDatabaseConnection,
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  handleValidationErrors,
  ErrorHandler.asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Note: express-validator's normalizeEmail() already normalized the email in req.body
  // For Gmail, it removes dots (e.g., m.subhan6612@gmail.com -> msubhan6612@gmail.com)
  // But we need to handle both cases since users might have been created with dots
  const originalEmail = (email || '').toLowerCase().trim();
  let normalizedEmail = originalEmail;
  
  // If it's a Gmail address, express-validator's normalizeEmail() removes dots
  // So we need to try both versions: with dots (as stored) and without dots (normalized)
  let gmailWithoutDots = null;
  if (normalizedEmail.includes('@gmail.com')) {
    const [localPart, domain] = normalizedEmail.split('@');
    gmailWithoutDots = localPart.replace(/\./g, '') + '@' + domain;
    // Use the normalized version (without dots) for primary search
    normalizedEmail = gmailWithoutDots;
  }
  
  console.log('🔵 LOGIN ATTEMPT:', {
    originalEmail: req.body.email,
    normalizedEmail: normalizedEmail,
    originalEmailLower: originalEmail,
    gmailWithoutDots: gmailWithoutDots,
    emailInBody: email,
    passwordLength: password?.length,
    passwordProvided: !!password,
    timestamp: new Date().toISOString()
  });
  
  // Debug: List all TWSAdmin users (first 5) to help debug
  try {
    const allTwsAdmins = await TWSAdmin.find({}).limit(10).select('email fullName role status');
    console.log('🔍 Available TWSAdmin users (first 10):', allTwsAdmins.map(u => ({
      email: u.email,
      emailLength: u.email?.length,
      fullName: u.fullName,
      role: u.role,
      status: u.status,
      matches: u.email === normalizedEmail || u.email?.toLowerCase() === normalizedEmail
    })));
    
    // Also check if the exact email exists
    const exactMatch = await TWSAdmin.findOne({ email: normalizedEmail });
    console.log('🔍 Direct TWSAdmin lookup result:', {
      searchedEmail: normalizedEmail,
      found: !!exactMatch,
      foundEmail: exactMatch?.email,
      foundId: exactMatch?._id
    });
  } catch (debugError) {
    console.log('⚠️ Could not fetch TWSAdmin list for debug:', debugError.message);
  }

  // Find user - check both TWSAdmin and User models
  // First try TWSAdmin (for Supra Admin users) - try multiple email formats
  // For Gmail: try both with dots (as stored) and without dots (normalized)
  let user = await TWSAdmin.findOne({ email: normalizedEmail });
  let userType = 'twsAdmin';
  
  // For Gmail addresses, also try the original with dots (in case user was created with dots)
  if (!user && originalEmail.includes('@gmail.com') && originalEmail !== normalizedEmail) {
    user = await TWSAdmin.findOne({ email: originalEmail });
    console.log('🔍 Tried Gmail with dots:', {
      email: originalEmail,
      found: !!user
    });
  }
  
  // If still not found, try case-insensitive regex search
  if (!user) {
    const emailRegex = new RegExp(`^${normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
    user = await TWSAdmin.findOne({ email: emailRegex });
  }
  
  // For Gmail, try regex that matches with or without dots (ali.bhai = alibhai)
  if (!user && originalEmail.includes('@gmail.com')) {
    const gmailBase = originalEmail.split('@')[0].replace(/\./g, ''); // Remove dots for matching
    const gmailDomain = originalEmail.split('@')[1];
    if (gmailBase && gmailDomain) {
      // Match any Gmail variant: ali.bhai, alibhai, a.l.i.b.h.a.i all match
      const gmailRegex = new RegExp(`^${gmailBase.split('').join('\\.?')}@${gmailDomain.replace(/\./g, '\\.')}$`, 'i');
      user = await TWSAdmin.findOne({ email: gmailRegex });
      console.log('🔍 Tried Gmail dot-flexible regex:', {
        pattern: gmailRegex.toString(),
        found: !!user
      });
    }
  }
  
  console.log('🔍 Checking TWSAdmin:', {
    email: normalizedEmail,
    originalEmail: email,
    found: !!user,
    userId: user?._id,
    foundEmail: user?.email,
    emailMatch: user ? (user.email === normalizedEmail) : false
  });
  
  // If not found in TWSAdmin, try User model (for tenant users)
  if (!user) {
    user = await User.findOne({ email: normalizedEmail }); // Try normalized first
    userType = 'user';
    
    // For Gmail addresses, also try the original with dots (in case user was created with dots)
    if (!user && originalEmail.includes('@gmail.com') && originalEmail !== normalizedEmail) {
      user = await User.findOne({ email: originalEmail });
      console.log('🔍 Tried User Gmail with dots:', {
        email: originalEmail,
        found: !!user
      });
    }
    
    if (!user) {
      user = await User.findOne({ email: email }); // Try exact match (already normalized by express-validator)
    }
    if (!user) {
      // Try case-insensitive search as last resort
      user = await User.findOne({ email: new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') });
    }
    
    // For Gmail, try regex that matches with or without dots (ali.bhai = alibhai)
    if (!user && originalEmail.includes('@gmail.com')) {
      const gmailBase = originalEmail.split('@')[0].replace(/\./g, ''); // Remove dots for matching
      const gmailDomain = originalEmail.split('@')[1];
      if (gmailBase && gmailDomain) {
        // Match any Gmail variant: ali.bhai, alibhai, a.l.i.b.h.a.i all match
        const gmailRegex = new RegExp(`^${gmailBase.split('').join('\\.?')}@${gmailDomain.replace(/\./g, '\\.')}$`, 'i');
        user = await User.findOne({ email: gmailRegex });
        console.log('🔍 Tried User Gmail dot-flexible regex:', {
          pattern: gmailRegex.toString(),
          found: !!user
        });
      }
    }
    
    console.log('🔍 Checking User model:', {
      email: normalizedEmail,
      found: !!user,
      userId: user?._id
    });
  }
  
  // Auto-create default admin user if it doesn't exist and default password is provided
  const defaultAdminEmails = ['admin@tws.com', 'admin@wolfstack.com'];
  const defaultPassword = 'admin123';
  
  // Determine role based on email - admin@tws.com should be super_admin for Supra Admin access
  const getDefaultRole = (email) => {
    if (email === 'admin@tws.com') {
      return 'super_admin'; // Supra Admin role
    }
    return 'owner'; // Regular admin role
  };
  
  if (!user && defaultAdminEmails.includes(normalizedEmail) && password === defaultPassword) {
    console.log('🔄 Creating default admin user...');
    
    // Get or create default organization
    const Organization = require('../../../models/Organization');
    let organization = await Organization.findOne({ slug: 'wolfstack' });
    if (!organization) {
      organization = new Organization({
        name: 'Wolf Stack',
        slug: 'wolfstack',
        description: 'Default organization for Wolf Stack Management Portal',
        plan: 'enterprise',
        status: 'active',
        settings: {
          timezone: 'UTC',
          dateFormat: 'MM/DD/YYYY',
          currency: 'USD',
          workingHours: {
            start: '09:00',
            end: '17:00',
            days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
          },
          features: {
            timeTracking: true,
            invoicing: true,
            integrations: true,
            aiFeatures: true
          }
        }
      });
      await organization.save();
      console.log('✅ Default organization created');
    }
    
    // Create default admin user with password: admin123
    const userRole = getDefaultRole(normalizedEmail);
    user = new User({
      email: normalizedEmail,
      password: defaultPassword, // Will be hashed by pre-save hook
      fullName: userRole === 'super_admin' ? 'TWS Supra Administrator' : 'System Administrator',
      role: userRole,
      orgId: organization._id,
      status: 'active',
      emailVerified: true,
      preferences: {
        theme: 'light',
        notifications: true,
        language: 'en'
      }
    });
    await user.save();
    console.log('✅ Default admin user created:', normalizedEmail, 'Password: admin123', 'Role:', userRole);
  }
  
  if (!user) {
    console.log('❌ USER NOT FOUND:', {
      normalizedEmail: normalizedEmail,
      originalEmail: email,
      checkedTWSAdmin: true,
      checkedUser: true
    });
    
    // Check if user exists in either model for better error message
    const twsAdminExists = await TWSAdmin.findOne({ email: normalizedEmail });
    const userExists = await User.findOne({ email: normalizedEmail });
    
    if (twsAdminExists || userExists) {
      console.log('⚠️ User exists but email matching failed:', {
        twsAdminExists: !!twsAdminExists,
        userExists: !!userExists,
        twsAdminEmail: twsAdminExists?.email,
        userEmail: userExists?.email
      });
    }
    
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }

  console.log('✅ USER FOUND:', {
    id: user._id,
    email: user.email,
    role: user.role,
    status: user.status,
    userType: userType,
    model: userType === 'twsAdmin' ? 'TWSAdmin' : 'User'
  });

  // Check password with error handling
  let isPasswordValid = false;
  try {
    isPasswordValid = await user.comparePassword(password);
  } catch (passwordError) {
    console.error('❌ Password comparison error:', {
      email: normalizedEmail,
      userType: userType,
      error: passwordError.message,
      stack: passwordError.stack
    });
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }
  
  console.log('🔐 Password check result:', {
    email: normalizedEmail,
    userType: userType,
    isValid: isPasswordValid,
    passwordProvided: !!password,
    passwordLength: password?.length
  });
  
  if (!isPasswordValid) {
    console.log('❌ PASSWORD INVALID for user:', normalizedEmail);
    console.log('🔍 Password check details:', {
      email: normalizedEmail,
      userExists: !!user,
      userId: user?._id,
      userRole: user?.role,
      userType: userType,
      userStatus: user?.status,
      passwordProvided: !!password,
      passwordLength: password?.length,
      isDefaultPassword: password === defaultPassword,
      model: userType === 'twsAdmin' ? 'TWSAdmin' : 'User'
    });
    
    // If it's a default admin email with default password but password doesn't match,
    // it might be an existing user with wrong password - provide helpful error
    if (defaultAdminEmails.includes(normalizedEmail) && password === defaultPassword) {
      console.log('⚠️ Default admin email with default password, but password validation failed.');
      console.log('💡 This might mean the user exists with a different password. Consider resetting the user.');
    }
    
    // For TWSAdmin users, provide more specific error
    if (userType === 'twsAdmin') {
      console.log('⚠️ TWSAdmin password validation failed. Check if password was hashed correctly during creation.');
    }
    
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }

  console.log('✅ PASSWORD VALID for user:', normalizedEmail);

  // Check if user is active
  if (user.status !== 'active') {
    return res.status(403).json({
      success: false,
      message: 'Account is not active'
    });
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // Generate tokens - use appropriate user ID
  const userId = user._id;
  
  // Build additional payload for token
  let additionalPayload = {};
  
  if (userType === 'twsAdmin') {
    // TWSAdmin users
    additionalPayload = { type: 'tws_admin', userId: { _id: userId, type: 'tws_admin' } };
  } else if (user.orgId) {
    // For tenant users (including software house employees), include tenant info in token
    const Organization = require('../../../models/Organization');
    const Tenant = require('../../../models/Tenant');
    
    let org;
    if (typeof user.orgId === 'object' && user.orgId._id) {
      org = await Organization.findById(user.orgId._id).select('slug name').lean();
    } else {
      org = await Organization.findById(user.orgId).select('slug name').lean();
    }
    
    if (org) {
      // Find tenant by organizationId or slug
      const tenant = await Tenant.findOne({
        $or: [
          { organizationId: org._id },
          { slug: org.slug }
        ]
      }).select('_id slug').lean();
      
      if (tenant) {
        // Include tenant info in token for software house employees
        additionalPayload = {
          tenantId: tenant._id.toString(),
          tenantSlug: tenant.slug,
          orgId: org._id.toString()
        };
        console.log('✅ Added tenant info to token:', {
          email: user.email,
          tenantId: tenant._id.toString(),
          tenantSlug: tenant.slug,
          orgId: org._id.toString()
        });
      }
    }
  }
  
  const { accessToken, refreshToken } = generateTokens(userId, additionalPayload);

  // Store refresh token
  if (user.refreshTokens && Array.isArray(user.refreshTokens)) {
    user.refreshTokens.push({ token: refreshToken });
  } else {
    // For TWSAdmin, refreshTokens might not be initialized
    user.refreshTokens = [{ token: refreshToken }];
  }
  await user.save();

  // SECURITY FIX: Set HttpOnly cookies instead of returning tokens in response
  setSecureCookie(res, 'accessToken', accessToken, { maxAge: 15 * 60 * 1000 }); // 15 minutes
  setRefreshTokenCookie(res, 'refreshToken', refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000 }); // 30 days

  // Prepare user data for response
  let userData = user.toJSON ? user.toJSON() : user;
  
  // Ensure id field is set from _id for frontend compatibility
  if (userData._id && !userData.id) {
    userData.id = userData._id.toString();
  }
  
  // For TWSAdmin users, set role to super_admin for Supra Admin access
  if (userType === 'twsAdmin') {
    userData.role = 'super_admin'; // Override role for Supra Admin portal access
    userData.userType = 'twsAdmin'; // Mark as TWSAdmin user
    // TWSAdmin users don't have orgId, so set it to null
    userData.orgId = null;
    userData.tenantId = null;
    console.log('✅ TWSAdmin user logged in:', {
      email: user.email,
      originalRole: user.role,
      assignedRole: 'super_admin',
      userId: user._id
    });
  }
  
  // Try to get organization data for tenant users
  if (user.orgId) {
    const Organization = require('../../../models/Organization');
    let org;
    
    // If orgId is already populated (object), use it directly
    if (typeof user.orgId === 'object' && user.orgId._id) {
      org = await Organization.findById(user.orgId._id).select('slug name');
    } else {
      // If orgId is just an ObjectId string, fetch it
      org = await Organization.findById(user.orgId).select('slug name');
    }
    
    if (org) {
      // Add org slug to user data for frontend to use as tenant slug
      userData.orgId = {
        _id: org._id,
        slug: org.slug,
        name: org.name
      };
      // Set tenantId for routing
      const tenantRoles = ['owner', 'admin', 'org_manager', 'project_manager', 'manager', 'employee', 'staff', 'developer', 'engineer', 'programmer'];
      if (tenantRoles.includes(user.role)) {
        userData.tenantId = org.slug;
        console.log('✅ Set tenantId for tenant user:', {
          email: user.email,
          role: user.role,
          tenantId: org.slug,
          orgSlug: org.slug
        });
      }
    } else {
      console.warn('⚠️ Organization not found for user:', {
        userId: user._id,
        orgId: user.orgId,
        role: user.role
      });
    }
  } else {
    if (user.tenantId) {
      const Organization = require('../../../models/Organization');
      const org = await Organization.findOne({ slug: user.tenantId }).select('slug name');
      if (org) {
        userData.orgId = {
          _id: org._id,
          slug: org.slug,
          name: org.name
        };
        userData.tenantId = org.slug;
        console.log('✅ Found org by tenantId and set tenantId:', {
          email: user.email,
          tenantId: user.tenantId,
          orgSlug: org.slug
        });
      }
    }
  }

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: userData
      // Tokens are now in HttpOnly cookies, not in response body
    }
  });
}));

// Refresh token
router.post('/refresh',
  tokenRefreshLimiter, // SECURITY: Rate limiting (10 refresh attempts per 15 minutes per IP)
  ErrorHandler.asyncHandler(async (req, res) => {
  // SECURITY FIX: Get refresh token from cookie instead of request body
  const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      message: 'Refresh token is required'
    });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-this-in-production');
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Check if refresh token exists in user's tokens
    const tokenExists = user.refreshTokens.some(token => token.token === refreshToken);
    if (!tokenExists) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id);

    // Remove old refresh token and add new one
    user.refreshTokens = user.refreshTokens.filter(token => token.token !== refreshToken);
    user.refreshTokens.push({ token: newRefreshToken });
    await user.save();

    // SECURITY FIX: Set new tokens in HttpOnly cookies
    setSecureCookie(res, 'accessToken', accessToken, { maxAge: 15 * 60 * 1000 }); // 15 minutes
    setRefreshTokenCookie(res, 'refreshToken', newRefreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000 }); // 30 days

    res.json({
      success: true,
      message: 'Token refreshed successfully'
      // Tokens are now in HttpOnly cookies, not in response body
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
}));

// Logout - Allow unauthenticated requests (frontend may call this even if login fails)
router.post('/logout', ErrorHandler.asyncHandler(async (req, res) => {
  try {
    // SECURITY FIX: Get refresh token from cookie instead of request body
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    
    // Try to get user from token if available
    const token = req.cookies?.accessToken || req.headers.authorization?.replace('Bearer ', '');
    
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-key-change-this-in-production');
        const user = await User.findById(decoded.userId);
        
        if (user && refreshToken) {
          // Remove refresh token from user
          await User.findByIdAndUpdate(user._id, {
            $pull: { refreshTokens: { token: refreshToken } }
          });
        }
      } catch (tokenError) {
        // Token is invalid, just continue with logout
        console.log('Logout: Invalid or expired token, continuing with logout');
      }
    } else if (refreshToken) {
      // Try to find user by refresh token
      const user = await User.findOne({ 'refreshTokens.token': refreshToken });
      if (user) {
        await User.findByIdAndUpdate(user._id, {
          $pull: { refreshTokens: { token: refreshToken } }
        });
      }
    }

    // SECURITY FIX: Clear HttpOnly cookies
    clearSecureCookie(res, 'accessToken');
    clearSecureCookie(res, 'refreshToken');

    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    // Even if logout fails, return success to frontend and clear cookies
    console.error('Logout error:', error);
    clearSecureCookie(res, 'accessToken');
    clearSecureCookie(res, 'refreshToken');
    res.json({
      success: true,
      message: 'Logout successful'
    });
  }
}));

// Get token info (for frontend to check if authenticated)
// SECURITY FIX: Returns token info from HttpOnly cookie
router.get('/token-info', ErrorHandler.asyncHandler(async (req, res) => {
  const token = req.cookies?.accessToken || req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.json({
      success: false,
      data: { token: null, authenticated: false }
    });
  }
  
  // Verify token is valid
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-key-change-this-in-production');
    return res.json({
      success: true,
      data: {
        token: token.substring(0, 20) + '...', // Only return preview, not full token
        authenticated: true,
        userId: decoded.userId,
        expiresAt: decoded.exp
      }
    });
  } catch (error) {
    return res.json({
      success: false,
      data: { token: null, authenticated: false }
    });
  }
}));

// Get current user
router.get('/me', authenticateToken, ErrorHandler.asyncHandler(async (req, res) => {
  // Check if user is TWSAdmin or regular User
  const isTWSAdmin = req.authContext?.type === 'tws_admin' || 
                     (req.user && !req.user.orgId && req.user.role?.startsWith('platform_'));
  
  let userData;
  
  if (isTWSAdmin) {
    // TWSAdmin user - already fetched by authenticateToken middleware
    userData = req.user.toJSON ? req.user.toJSON() : req.user;
    // Ensure id field is set from _id for frontend compatibility
    if (userData._id && !userData.id) {
      userData.id = userData._id.toString();
    }
    // Ensure role is set to super_admin for Supra Admin portal access
    userData.role = 'super_admin';
    userData.userType = 'twsAdmin';
    userData.orgId = null;
    userData.tenantId = null;
  } else {
    // Regular User - fetch fresh data with orgId populated (lean + select for speed)
    const User = require('../../../models/User');
    const user = await User.findById(req.user._id)
      .select('_id email fullName role orgId phone department jobTitle profilePicUrl status')
      .populate('orgId', 'slug name')
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    userData = { ...user };
    
    // Ensure id field is set from _id for frontend compatibility
    if (userData._id && !userData.id) {
      userData.id = userData._id.toString();
    }
    
    if (user.orgId) {
      // If orgId is already populated, use it directly
      if (typeof user.orgId === 'object' && user.orgId.slug) {
        userData.orgId = {
          _id: user.orgId._id,
          slug: user.orgId.slug,
          name: user.orgId.name
        };
        // Set tenantId for routing
        const tenantRoles = ['owner', 'admin', 'org_manager', 'project_manager', 'manager', 'employee', 'staff', 'developer', 'engineer', 'programmer'];
        if (tenantRoles.includes(user.role)) {
          userData.tenantId = user.orgId.slug;
        }
      } else {
        const Organization = require('../../../models/Organization');
        const org = await Organization.findById(user.orgId).select('slug name');
        if (org) {
          userData.orgId = {
            _id: org._id,
            slug: org.slug,
            name: org.name
          };
          const tenantRoles = ['owner', 'admin', 'org_manager', 'project_manager', 'manager', 'employee', 'staff', 'developer', 'engineer', 'programmer'];
          if (tenantRoles.includes(user.role)) {
            userData.tenantId = org.slug;
          }
        }
      }
    }
  }
  
  res.json({
    success: true,
    data: {
      user: userData
    }
  });
}));

// Change password
router.post('/change-password',
  authenticateToken,
  strictLimiter, // SECURITY: Rate limiting (10 requests per 15 minutes per user)
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 6 }),
  handleValidationErrors,
  ErrorHandler.asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id);

  // Verify current password
  const isCurrentPasswordValid = await user.comparePassword(currentPassword);
  if (!isCurrentPasswordValid) {
    return res.status(400).json({
      success: false,
      message: 'Current password is incorrect'
    });
  }

  // Update password
  user.password = newPassword;
  // Clear mustChangePassword flag if it was set
  if (user.mustChangePassword) {
    user.mustChangePassword = false;
  }
  await user.save();

  res.json({
    success: true,
    message: 'Password changed successfully'
  });
}));

// Forgot password - Request password reset
router.post('/forgot-password',
  passwordResetLimiter, // SECURITY: Rate limiting (3 password reset requests per hour per IP)
  checkDatabaseConnection,
  body('email').isEmail().normalizeEmail(),
  handleValidationErrors,
  ErrorHandler.asyncHandler(async (req, res) => {
  const { email } = req.body;
  const normalizedEmail = email.toLowerCase().trim();

  // Find user
  const user = await User.findOne({ email: normalizedEmail });
  
  // For security, don't reveal if user exists or not
  if (!user) {
    // Still return success to prevent email enumeration
    return res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    });
  }

  // Check if user is active
  if (user.status !== 'active') {
    return res.status(403).json({
      success: false,
      message: 'Account is not active. Please contact administrator.'
    });
  }

  // Generate temporary password (8 characters)
  const crypto = require('crypto');
  const tempPassword = crypto.randomBytes(4).toString('hex'); // 8 character password
  
  // Update user password
  user.password = tempPassword;
  user.mustChangePassword = true; // Force password change on next login
  await user.save();

  // Send password reset email
  try {
    const emailService = require('../../../services/integrations/email.service');
    await emailService.sendPasswordResetEmail(user, tempPassword);
    
    res.json({
      success: true,
      message: 'A temporary password has been sent to your email. Please check your inbox and change your password after logging in.'
    });
  } catch (emailError) {
    console.error('Error sending password reset email:', emailError);
    // Still return success but log the error
    res.json({
      success: true,
      message: 'Password reset initiated. Please contact administrator if you do not receive the email.',
      // In development, return the temp password for testing
      ...(process.env.NODE_ENV === 'development' && { tempPassword })
    });
  }
}));

// GTS Admin Login removed - functionality consolidated into TWS Admin / Supra Admin

module.exports = router;
