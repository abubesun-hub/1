// Authentication and User Management System
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.sessionTimeout = 8 * 60 * 60 * 1000; // 8 hours
        this.init();
    }

    init() {
        this.checkSession();
        this.setupSessionTimeout();
    }

    // Check if user session is valid
    checkSession() {
        const savedUser = localStorage.getItem('currentUser');
        const sessionStart = localStorage.getItem('sessionStart');
        
        if (savedUser && sessionStart) {
            const sessionAge = Date.now() - parseInt(sessionStart);
            
            if (sessionAge < this.sessionTimeout) {
                this.currentUser = JSON.parse(savedUser);
                return true;
            } else {
                this.logout();
                return false;
            }
        }
        return false;
    }

    // Login user
    async login(username, password) {
        try {
            // Validate credentials
            const user = await this.validateCredentials(username, password);
            
            if (user) {
                this.currentUser = user;
                this.saveSession(user);
                this.logLoginAttempt(username, true);
                return { success: true, user: user };
            } else {
                this.logLoginAttempt(username, false);
                return { success: false, message: 'اسم المستخدم أو كلمة المرور غير صحيحة' };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'حدث خطأ أثناء تسجيل الدخول' };
        }
    }

    // Validate user credentials
    async validateCredentials(username, password) {
        // Get users from storage
        const users = StorageManager.getData(StorageManager.STORAGE_KEYS.USERS) || [];
        
        // Default admin user if no users exist
        if (users.length === 0) {
            const defaultAdmin = {
                id: StorageManager.generateId(),
                username: 'admin',
                password: this.hashPassword('admin123'),
                name: 'المدير العام',
                role: 'admin',
                permissions: ['all'],
                isActive: true,
                createdAt: new Date().toISOString()
            };
            users.push(defaultAdmin);
            StorageManager.saveData(StorageManager.STORAGE_KEYS.USERS, users);
        }

        // Find user
        const user = users.find(u => u.username === username && u.isActive);
        
        if (user && this.verifyPassword(password, user.password)) {
            // Return user without password
            const { password: _, ...userWithoutPassword } = user;
            return {
                ...userWithoutPassword,
                loginTime: new Date().toISOString()
            };
        }
        
        return null;
    }

    // Save user session
    saveSession(user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('sessionStart', Date.now().toString());
    }

    // Logout user
    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        localStorage.removeItem('sessionStart');
        
        // Redirect to login if on dashboard
        if (window.app) {
            window.app.showLogin();
        }
    }

    // Setup session timeout
    setupSessionTimeout() {
        setInterval(() => {
            if (!this.checkSession()) {
                if (this.currentUser) {
                    alert('انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.');
                    this.logout();
                }
            }
        }, 60000); // Check every minute
    }

    // Hash password (simple implementation)
    hashPassword(password) {
        // In production, use a proper hashing library like bcrypt
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString();
    }

    // Verify password
    verifyPassword(password, hashedPassword) {
        return this.hashPassword(password) === hashedPassword;
    }

    // Log login attempts
    logLoginAttempt(username, success) {
        const attempts = JSON.parse(localStorage.getItem('loginAttempts') || '[]');
        attempts.push({
            username,
            success,
            timestamp: new Date().toISOString(),
            ip: 'localhost' // In production, get real IP
        });
        
        // Keep only last 100 attempts
        if (attempts.length > 100) {
            attempts.splice(0, attempts.length - 100);
        }
        
        localStorage.setItem('loginAttempts', JSON.stringify(attempts));
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Check if user has permission
    hasPermission(permission) {
        if (!this.currentUser) return false;

        // Special case for admin and manager users
        const username = this.currentUser.username;
        if (username === 'admin') return true; // Admin has all permissions
        if (username === 'manager' && ['capital', 'expenses', 'reports', 'users'].includes(permission)) return true;
        if (username === 'accountant' && ['capital', 'expenses', 'reports'].includes(permission)) return true;

        const userPermissions = this.currentUser.permissions || [];
        return userPermissions.includes('all') || userPermissions.includes(permission);
    }

    // Get user role
    getUserRole() {
        return this.currentUser?.role || 'guest';
    }

    // Change password
    async changePassword(currentPassword, newPassword) {
        if (!this.currentUser) {
            return { success: false, message: 'يجب تسجيل الدخول أولاً' };
        }

        const users = StorageManager.getData(StorageManager.STORAGE_KEYS.USERS) || [];
        const userIndex = users.findIndex(u => u.id === this.currentUser.id);
        
        if (userIndex === -1) {
            return { success: false, message: 'المستخدم غير موجود' };
        }

        // Verify current password
        if (!this.verifyPassword(currentPassword, users[userIndex].password)) {
            return { success: false, message: 'كلمة المرور الحالية غير صحيحة' };
        }

        // Validate new password
        const passwordValidation = this.validatePassword(newPassword);
        if (!passwordValidation.valid) {
            return { success: false, message: passwordValidation.message };
        }

        // Update password
        users[userIndex].password = this.hashPassword(newPassword);
        users[userIndex].passwordChangedAt = new Date().toISOString();
        
        if (StorageManager.saveData(StorageManager.STORAGE_KEYS.USERS, users)) {
            return { success: true, message: 'تم تغيير كلمة المرور بنجاح' };
        } else {
            return { success: false, message: 'حدث خطأ أثناء تغيير كلمة المرور' };
        }
    }

    // Validate password strength
    validatePassword(password) {
        if (password.length < 6) {
            return { valid: false, message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' };
        }
        
        if (!/[a-zA-Z]/.test(password)) {
            return { valid: false, message: 'كلمة المرور يجب أن تحتوي على حروف' };
        }
        
        if (!/[0-9]/.test(password)) {
            return { valid: false, message: 'كلمة المرور يجب أن تحتوي على أرقام' };
        }
        
        return { valid: true };
    }

    // Create new user (admin only)
    async createUser(userData) {
        // Check if user is logged in and is admin or manager
        if (!this.currentUser) {
            return { success: false, message: 'يجب تسجيل الدخول أولاً' };
        }

        const username = this.currentUser.username;
        if (username !== 'admin' && username !== 'manager') {
            return { success: false, message: 'ليس لديك صلاحية لإنشاء مستخدمين' };
        }

        const users = StorageManager.getData(StorageManager.STORAGE_KEYS.USERS) || [];
        
        // Check if username already exists
        if (users.some(u => u.username === userData.username)) {
            return { success: false, message: 'اسم المستخدم موجود بالفعل' };
        }

        // Validate password
        const passwordValidation = this.validatePassword(userData.password);
        if (!passwordValidation.valid) {
            return { success: false, message: passwordValidation.message };
        }

        // Create new user
        const newUser = {
            id: StorageManager.generateId(),
            username: userData.username,
            password: this.hashPassword(userData.password),
            name: userData.name,
            role: userData.role || 'user',
            permissions: userData.permissions || [],
            isActive: true,
            createdAt: new Date().toISOString(),
            createdBy: this.currentUser.id
        };

        users.push(newUser);
        
        if (StorageManager.saveData(StorageManager.STORAGE_KEYS.USERS, users)) {
            return { success: true, message: 'تم إنشاء المستخدم بنجاح', user: newUser };
        } else {
            return { success: false, message: 'حدث خطأ أثناء إنشاء المستخدم' };
        }
    }

    // Update user (admin only)
    async updateUser(userId, updateData) {
        // Check if user is logged in and is admin or manager
        if (!this.currentUser) {
            return { success: false, message: 'يجب تسجيل الدخول أولاً' };
        }

        const username = this.currentUser.username;
        if (username !== 'admin' && username !== 'manager') {
            return { success: false, message: 'ليس لديك صلاحية لتعديل المستخدمين' };
        }

        const users = StorageManager.getData(StorageManager.STORAGE_KEYS.USERS) || [];
        const userIndex = users.findIndex(u => u.id === userId);
        
        if (userIndex === -1) {
            return { success: false, message: 'المستخدم غير موجود' };
        }

        // Update user data
        const updatedUser = {
            ...users[userIndex],
            ...updateData,
            updatedAt: new Date().toISOString(),
            updatedBy: this.currentUser.id
        };

        // If password is being updated, hash it
        if (updateData.password) {
            const passwordValidation = this.validatePassword(updateData.password);
            if (!passwordValidation.valid) {
                return { success: false, message: passwordValidation.message };
            }
            updatedUser.password = this.hashPassword(updateData.password);
        }

        users[userIndex] = updatedUser;
        
        if (StorageManager.saveData(StorageManager.STORAGE_KEYS.USERS, users)) {
            return { success: true, message: 'تم تحديث المستخدم بنجاح' };
        } else {
            return { success: false, message: 'حدث خطأ أثناء تحديث المستخدم' };
        }
    }

    // Deactivate user (admin only)
    async deactivateUser(userId) {
        // Check if user is logged in and is admin or manager
        if (!this.currentUser) {
            return { success: false, message: 'يجب تسجيل الدخول أولاً' };
        }

        const username = this.currentUser.username;
        if (username !== 'admin' && username !== 'manager') {
            return { success: false, message: 'ليس لديك صلاحية لإلغاء تفعيل المستخدمين' };
        }

        if (userId === this.currentUser.id) {
            return { success: false, message: 'لا يمكنك إلغاء تفعيل حسابك الخاص' };
        }

        return this.updateUser(userId, { isActive: false });
    }

    // Get all users (admin only)
    getAllUsers() {
        // Check if user is logged in and is admin or manager
        if (!this.currentUser) {
            return [];
        }

        const username = this.currentUser.username;
        if (username !== 'admin' && username !== 'manager') {
            return [];
        }

        const users = StorageManager.getData(StorageManager.STORAGE_KEYS.USERS) || [];
        return users.map(user => {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        });
    }

    // Get login attempts (admin only)
    getLoginAttempts() {
        if (!this.hasPermission('users') && !this.hasPermission('all')) {
            return [];
        }

        return JSON.parse(localStorage.getItem('loginAttempts') || '[]');
    }
}

// Initialize auth manager
const authManager = new AuthManager();

// Export for global use
window.AuthManager = authManager;

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthManager;
}
