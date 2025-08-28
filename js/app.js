// Main Application Controller
class AccountingApp {
    constructor() {
        this.currentUser = null;
        this.currentSection = 'dashboard';
        this.exchangeRate = 1500; // USD to IQD exchange rate
        this.init();
    }

    init() {
        this.initializeEventListeners();
        this.loadExchangeRate();
        this.checkAuthStatus();
    }

    initializeEventListeners() {
        // Login form submission
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        // Navigation clicks
        document.addEventListener('click', (e) => {
            if (e.target.matches('.nav-link') || e.target.closest('.nav-link')) {
                e.preventDefault();
                const link = e.target.matches('.nav-link') ? e.target : e.target.closest('.nav-link');
                const section = link.getAttribute('onclick')?.match(/showSection\('(.+)'\)/)?.[1];
                if (section) {
                    this.showSection(section);
                }
            }
        });

        // Auto-save functionality
        setInterval(() => {
            this.autoSave();
        }, 60000); // Auto-save every minute

        // Handle offline/online status
        window.addEventListener('online', () => {
            this.showNotification('تم الاتصال بالإنترنت', 'success');
        });

        window.addEventListener('offline', () => {
            this.showNotification('تم قطع الاتصال - العمل في وضع عدم الاتصال', 'warning');
        });
    }

    checkAuthStatus() {
        // Check AuthManager first
        if (window.AuthManager && window.AuthManager.checkSession && window.AuthManager.checkSession()) {
            this.currentUser = window.AuthManager.getCurrentUser();
            this.showDashboard();
            return;
        }

        // Fallback: check localStorage
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            // Also update AuthManager if available
            if (window.AuthManager) {
                window.AuthManager.currentUser = this.currentUser;
            }
            this.showDashboard();
        } else {
            this.showLogin();
        }
    }

    async handleLogin() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // Use AuthManager for authentication
        if (window.AuthManager) {
            const result = await window.AuthManager.login(username, password);
            if (result.success) {
                this.currentUser = result.user;
                localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
                this.showDashboard();
                this.showNotification('تم تسجيل الدخول بنجاح', 'success');
            } else {
                this.showNotification(result.message, 'error');
            }
        } else {
            // Fallback authentication
            if (this.validateCredentials(username, password)) {
                this.currentUser = {
                    username: username,
                    loginTime: new Date().toISOString(),
                    permissions: this.getUserPermissions(username)
                };

                localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
                this.showDashboard();
                this.showNotification('تم تسجيل الدخول بنجاح', 'success');
            } else {
                this.showNotification('اسم المستخدم أو كلمة المرور غير صحيحة', 'error');
            }
        }
    }

    validateCredentials(username, password) {
        // Default credentials (in production, this should be stored securely)
        const defaultCredentials = [
            { username: 'admin', password: 'admin123' },
            { username: 'manager', password: 'manager123' },
            { username: 'accountant', password: 'acc123' }
        ];

        return defaultCredentials.some(cred => 
            cred.username === username && cred.password === password
        );
    }

    getUserPermissions(username) {
        const permissions = {
            'admin': ['all'],
            'manager': ['capital', 'expenses', 'reports', 'users'],
            'accountant': ['capital', 'expenses', 'reports']
        };

        return permissions[username] || ['capital', 'expenses'];
    }

    showLogin() {
        document.getElementById('loginPage').style.display = 'flex';
        document.getElementById('mainDashboard').style.display = 'none';
    }

    showDashboard() {
        document.getElementById('loginPage').style.display = 'none';
        document.getElementById('mainDashboard').style.display = 'block';
        
        // Update user display
        const currentUserElement = document.getElementById('currentUser');
        if (currentUserElement && this.currentUser) {
            currentUserElement.textContent = this.currentUser.username;
        }

        // Load dashboard data
        this.loadDashboardData();
    }

    showSection(sectionName) {
        // Hide all sections
        const sections = document.querySelectorAll('.content-section');
        sections.forEach(section => {
            section.style.display = 'none';
        });

        // Remove active class from all nav links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.classList.remove('active');
        });

        // Show selected section
        const targetSection = document.getElementById(sectionName + 'Section');
        if (targetSection) {
            targetSection.style.display = 'block';
            targetSection.classList.add('fade-in');
        }

        // Add active class to current nav link
        const activeLink = document.querySelector(`[onclick="showSection('${sectionName}')"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }

        this.currentSection = sectionName;

        // Load section-specific data
        switch (sectionName) {
            case 'dashboard':
                this.loadDashboardData();
                break;
            case 'capital':
                this.loadCapitalSection();
                break;
            case 'expenses':
                this.loadExpensesSection();
                break;
            case 'reports':
                this.loadReportsSection();
                break;
            case 'users':
                this.loadUsersSection();
                break;
        }
    }

    loadCapitalSection() {
        // Capital section is handled by CapitalManager
        if (window.capitalManager) {
            window.capitalManager.loadCapitalSection();
        }
    }

    loadExpensesSection() {
        // Expenses section is handled by ExpensesManager
        if (window.expensesManager) {
            window.expensesManager.loadExpensesSection();
        }
    }

    loadReportsSection() {
        // Reports section implementation
        const reportsSection = document.getElementById('reportsSection');
        if (!reportsSection) return;

        const reportsHTML = `
            <div class="neumorphic-card">
                <div class="card-header">
                    <h4><i class="bi bi-graph-up me-2"></i>التقارير والإحصائيات</h4>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-4 mb-3">
                            <button class="btn btn-primary neumorphic-btn w-100" onclick="app.generateFinancialReport()">
                                <i class="bi bi-file-earmark-text me-2"></i>
                                تقرير مالي شامل
                            </button>
                        </div>
                        <div class="col-md-4 mb-3">
                            <button class="btn btn-success neumorphic-btn w-100" onclick="app.generateCapitalReport()">
                                <i class="bi bi-cash-stack me-2"></i>
                                تقرير رأس المال
                            </button>
                        </div>
                        <div class="col-md-4 mb-3">
                            <button class="btn btn-danger neumorphic-btn w-100" onclick="app.generateExpensesReport()">
                                <i class="bi bi-receipt me-2"></i>
                                تقرير المصروفات
                            </button>
                        </div>
                    </div>
                    <div class="mt-4">
                        <h5>تقارير سريعة</h5>
                        <div id="quickReports">
                            <!-- Quick reports will be loaded here -->
                        </div>
                    </div>
                </div>
            </div>
        `;

        reportsSection.innerHTML = reportsHTML;
        this.loadQuickReports();
    }

    loadUsersSection() {
        // Users section implementation
        const usersSection = document.getElementById('usersSection');
        if (!usersSection) return;

        const usersHTML = `
            <div class="neumorphic-card">
                <div class="card-header">
                    <h4><i class="bi bi-people me-2"></i>إدارة المستخدمين والصلاحيات</h4>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <button class="btn btn-primary neumorphic-btn w-100" onclick="app.showAddUserForm()">
                                <i class="bi bi-person-plus me-2"></i>
                                إضافة مستخدم جديد
                            </button>
                        </div>
                        <div class="col-md-6 mb-3">
                            <button class="btn btn-secondary neumorphic-btn w-100" onclick="app.showUsersList()">
                                <i class="bi bi-list me-2"></i>
                                قائمة المستخدمين
                            </button>
                        </div>
                    </div>
                    <div class="mt-4">
                        <div id="usersContent">
                            <!-- Users content will be loaded here -->
                        </div>
                    </div>
                </div>
            </div>
        `;

        usersSection.innerHTML = usersHTML;
        this.showUsersList();
    }

    loadQuickReports() {
        const data = StorageManager.getAllData();
        const totals = this.calculateTotals(data);

        const quickReportsHTML = `
            <div class="row">
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-body">
                            <h6>الملخص المالي</h6>
                            <p>رأس المال: ${this.formatCurrency(totals.totalUSD, 'USD')} | ${this.formatCurrency(totals.totalIQD, 'IQD')}</p>
                            <p>المصروفات: ${this.formatCurrency(totals.expensesUSD, 'USD')} | ${this.formatCurrency(totals.expensesIQD, 'IQD')}</p>
                            <p>المتبقي: ${this.formatCurrency(totals.totalUSD - totals.expensesUSD, 'USD')} | ${this.formatCurrency(totals.totalIQD - totals.expensesIQD, 'IQD')}</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-body">
                            <h6>إحصائيات العمليات</h6>
                            <p>عدد المساهمين: ${data.shareholders?.length || 0}</p>
                            <p>إدخالات رأس المال: ${data.capital?.length || 0}</p>
                            <p>المصروفات: ${data.expenses?.length || 0}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const quickReportsElement = document.getElementById('quickReports');
        if (quickReportsElement) {
            quickReportsElement.innerHTML = quickReportsHTML;
        }
    }

    showUsersList() {
        // Check if user is logged in using this.currentUser
        if (!this.currentUser) {
            document.getElementById('usersContent').innerHTML = '<p class="text-danger">يجب تسجيل الدخول أولاً</p>';
            return;
        }

        // Allow admin and manager users
        const username = this.currentUser.username;
        if (username !== 'admin' && username !== 'manager') {
            document.getElementById('usersContent').innerHTML = '<p class="text-danger">ليس لديك صلاحية لعرض المستخدمين</p>';
            return;
        }

        // Get users from AuthManager or fallback
        let users = [];
        if (window.AuthManager && window.AuthManager.getAllUsers) {
            users = window.AuthManager.getAllUsers();
        } else {
            // Fallback: get users from storage directly
            users = StorageManager.getData(StorageManager.STORAGE_KEYS.USERS) || [];
            users = users.map(user => {
                const { password, ...userWithoutPassword } = user;
                return userWithoutPassword;
            });
        }
        const usersListHTML = `
            <div class="table-responsive">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>اسم المستخدم</th>
                            <th>الاسم</th>
                            <th>الدور</th>
                            <th>الحالة</th>
                            <th>تاريخ الإنشاء</th>
                            <th>الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${users.map(user => `
                            <tr>
                                <td>${user.username}</td>
                                <td>${user.name}</td>
                                <td><span class="badge bg-info">${user.role}</span></td>
                                <td><span class="badge bg-${user.isActive ? 'success' : 'danger'}">${user.isActive ? 'نشط' : 'معطل'}</span></td>
                                <td>${this.formatDate(user.createdAt)}</td>
                                <td>
                                    <div class="btn-group btn-group-sm">
                                        <button class="btn btn-outline-primary" onclick="app.editUser('${user.id}')">
                                            <i class="bi bi-pencil"></i>
                                        </button>
                                        <button class="btn btn-outline-danger" onclick="app.deactivateUser('${user.id}')">
                                            <i class="bi bi-person-x"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        document.getElementById('usersContent').innerHTML = usersListHTML;
    }

    // Report generation methods
    generateFinancialReport() {
        if (window.reportsManager) {
            window.reportsManager.generateFinancialReport();
        }
    }

    generateCapitalReport() {
        if (window.reportsManager) {
            window.reportsManager.generateCapitalReport();
        }
    }

    generateExpensesReport() {
        if (window.reportsManager) {
            window.reportsManager.generateExpensesReport();
        }
    }

    showAddUserForm() {
        // Check if user is logged in using this.currentUser
        if (!this.currentUser) {
            this.showNotification('يجب تسجيل الدخول أولاً', 'error');
            return;
        }

        // Debug: Check current user and permissions
        console.log('Current user in app.js:', this.currentUser);
        console.log('AuthManager current user:', window.AuthManager ? window.AuthManager.getCurrentUser() : 'AuthManager not available');

        // Sync AuthManager with app currentUser
        if (window.AuthManager && this.currentUser) {
            window.AuthManager.currentUser = this.currentUser;
            console.log('Synced AuthManager currentUser');
        }

        // Allow admin and manager users
        const username = this.currentUser.username;
        if (username !== 'admin' && username !== 'manager') {
            this.showNotification('ليس لديك صلاحية لإضافة مستخدمين. يجب أن تكون مدير أو مدير قسم.', 'error');
            return;
        }

        const addUserFormHTML = `
            <div class="neumorphic-card">
                <div class="card-header">
                    <h5><i class="bi bi-person-plus me-2"></i>إضافة مستخدم جديد</h5>
                </div>
                <div class="card-body">
                    <form id="addUserForm" class="row">
                        <div class="col-md-6 mb-3">
                            <label for="newUsername" class="form-label">اسم المستخدم (إنجليزي)</label>
                            <input type="text" class="form-control neumorphic-input" id="newUsername"
                                   placeholder="admin, user123, etc."
                                   pattern="[a-zA-Z0-9_]+"
                                   title="يجب أن يحتوي على أحرف إنجليزية وأرقام فقط"
                                   required>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="newUserName" class="form-label">الاسم الكامل (عربي أو إنجليزي)</label>
                            <input type="text" class="form-control neumorphic-input" id="newUserName"
                                   placeholder="أحمد محمد أو Ahmed Mohamed"
                                   required>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="newUserPassword" class="form-label">كلمة المرور</label>
                            <input type="password" class="form-control neumorphic-input" id="newUserPassword" required>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="newUserRole" class="form-label">الدور</label>
                            <select class="form-control neumorphic-input" id="newUserRole" required>
                                <option value="">اختر الدور</option>
                                <option value="admin">مدير</option>
                                <option value="manager">مدير قسم</option>
                                <option value="accountant">محاسب</option>
                                <option value="user">مستخدم</option>
                            </select>
                        </div>
                        <div class="col-12 mb-3">
                            <label class="form-label">الصلاحيات</label>
                            <div class="row">
                                <div class="col-md-3">
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="permCapital" value="capital">
                                        <label class="form-check-label" for="permCapital">رأس المال</label>
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="permExpenses" value="expenses">
                                        <label class="form-check-label" for="permExpenses">المصروفات</label>
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="permReports" value="reports">
                                        <label class="form-check-label" for="permReports">التقارير</label>
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="permUsers" value="users">
                                        <label class="form-check-label" for="permUsers">المستخدمون</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-12">
                            <button type="submit" class="btn btn-primary neumorphic-btn">
                                <i class="bi bi-save me-2"></i>حفظ المستخدم
                            </button>
                            <button type="button" class="btn btn-secondary neumorphic-btn ms-2" onclick="app.showUsersList()">
                                <i class="bi bi-arrow-right me-2"></i>العودة للقائمة
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.getElementById('usersContent').innerHTML = addUserFormHTML;
        this.setupAddUserForm();
    }

    setupAddUserForm() {
        const form = document.getElementById('addUserForm');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Get form data with trimming and validation
            const username = document.getElementById('newUsername').value.trim();
            const name = document.getElementById('newUserName').value.trim();
            const password = document.getElementById('newUserPassword').value;
            const role = document.getElementById('newUserRole').value;

            // Validate required fields
            if (!username || !name || !password || !role) {
                this.showNotification('جميع الحقول مطلوبة', 'error');
                return;
            }

            // Validate username (English only)
            if (!/^[a-zA-Z0-9_]+$/.test(username)) {
                this.showNotification('اسم المستخدم يجب أن يحتوي على أحرف إنجليزية وأرقام فقط', 'error');
                return;
            }

            // Validate name (allow Arabic and English)
            if (name.length < 2) {
                this.showNotification('الاسم يجب أن يكون أكثر من حرفين', 'error');
                return;
            }

            const userData = {
                username: username,
                name: name,
                password: password,
                role: role,
                permissions: []
            };

            // Collect permissions
            const permissionCheckboxes = form.querySelectorAll('input[type="checkbox"]:checked');
            permissionCheckboxes.forEach(checkbox => {
                userData.permissions.push(checkbox.value);
            });

            console.log('Form data collected:', userData);

            // Create user directly using StorageManager
            let result;
            if (window.AuthManager && window.AuthManager.createUser) {
                result = await window.AuthManager.createUser(userData);
            } else {
                // Fallback: create user directly
                result = this.createUserDirectly(userData);
            }

            if (result.success) {
                this.showNotification(result.message, 'success');
                this.showUsersList();
            } else {
                this.showNotification(result.message, 'error');
            }
        });
    }

    // Create user directly using StorageManager
    createUserDirectly(userData) {
        try {
            console.log('Creating user with data:', userData);

            // Validate input data
            if (!userData.username || !userData.name || !userData.password) {
                return { success: false, message: 'جميع الحقول مطلوبة' };
            }

            // Validate Arabic text support
            if (userData.name.length === 0 || userData.username.length === 0) {
                return { success: false, message: 'الاسم واسم المستخدم لا يمكن أن يكونا فارغين' };
            }

            const users = StorageManager.getData(StorageManager.STORAGE_KEYS.USERS) || [];
            console.log('Current users:', users);

            // Check if username already exists
            if (users.some(u => u.username === userData.username)) {
                return { success: false, message: 'اسم المستخدم موجود بالفعل' };
            }

            // Hash password (simple implementation)
            const hashedPassword = this.hashPassword(userData.password);
            console.log('Password hashed successfully');

            // Create new user with Arabic support
            const newUser = {
                id: StorageManager.generateId(),
                username: userData.username.trim(),
                password: hashedPassword,
                name: userData.name.trim(),
                role: userData.role || 'user',
                permissions: userData.permissions || [],
                isActive: true,
                createdAt: new Date().toISOString(),
                createdBy: this.currentUser ? this.currentUser.id : 'system'
            };

            console.log('New user object:', newUser);

            users.push(newUser);
            console.log('User added to array, attempting to save...');

            const saveResult = StorageManager.saveData(StorageManager.STORAGE_KEYS.USERS, users);
            console.log('Save result:', saveResult);

            if (saveResult) {
                console.log('User created successfully');
                return { success: true, message: 'تم إنشاء المستخدم بنجاح' };
            } else {
                console.error('Failed to save user data');
                return { success: false, message: 'فشل في حفظ بيانات المستخدم' };
            }
        } catch (error) {
            console.error('Error creating user:', error);
            console.error('Error details:', error.message, error.stack);
            return { success: false, message: `حدث خطأ أثناء إنشاء المستخدم: ${error.message}` };
        }
    }

    // Simple password hashing
    hashPassword(password) {
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString();
    }

    editUser(userId) {
        // Implementation for editing user
        this.showNotification('تعديل المستخدم - قيد التطوير', 'info');
    }

    deactivateUser(userId) {
        if (confirm('هل أنت متأكد من إلغاء تفعيل هذا المستخدم؟')) {
            window.AuthManager.deactivateUser(userId).then(result => {
                if (result.success) {
                    this.showNotification(result.message, 'success');
                    this.showUsersList();
                } else {
                    this.showNotification(result.message, 'error');
                }
            });
        }
    }

    loadDashboardData() {
        const data = StorageManager.getAllData();

        // Calculate totals
        const totals = this.calculateTotals(data);

        // Update statistics cards
        this.updateStatisticsCards(totals);

        // Load recent transactions
        this.loadRecentTransactions(data);
    }

    calculateTotals(data) {
        let totalUSD = 0;
        let totalIQD = 0;
        let revenueUSD = 0;
        let revenueIQD = 0;
        let expensesUSD = 0;
        let expensesIQD = 0;

        // Calculate capital totals
        if (data.capital) {
            data.capital.forEach(entry => {
                if (entry.currency === 'USD') {
                    totalUSD += parseFloat(entry.amount) || 0;
                } else if (entry.currency === 'IQD') {
                    totalIQD += parseFloat(entry.amount) || 0;
                }
            });
        }

        // Calculate expenses totals
        if (data.expenses) {
            data.expenses.forEach(entry => {
                if (entry.currency === 'USD') {
                    expensesUSD += parseFloat(entry.amount) || 0;
                } else if (entry.currency === 'IQD') {
                    expensesIQD += parseFloat(entry.amount) || 0;
                }
            });
        }

        // Calculate revenues (for now, same as capital - can be extended)
        revenueUSD = totalUSD;
        revenueIQD = totalIQD;

        // Calculate remaining amounts
        const remainingUSD = totalUSD - expensesUSD;
        const remainingIQD = totalIQD - expensesIQD;

        return {
            totalUSD: remainingUSD,
            totalIQD: remainingIQD,
            revenueUSD,
            revenueIQD,
            expensesUSD,
            expensesIQD
        };
    }

    updateStatisticsCards(totals) {
        const totalUSDElement = document.getElementById('totalUSD');
        const totalIQDElement = document.getElementById('totalIQD');
        const totalRevenueElement = document.getElementById('totalRevenue');
        const totalExpensesElement = document.getElementById('totalExpenses');

        if (totalUSDElement) {
            totalUSDElement.textContent = this.formatCurrency(totals.totalUSD, 'USD');
        }
        if (totalIQDElement) {
            totalIQDElement.textContent = this.formatCurrency(totals.totalIQD, 'IQD');
        }
        if (totalRevenueElement) {
            totalRevenueElement.textContent = this.formatCurrency(totals.revenueUSD, 'USD');
        }
        if (totalExpensesElement) {
            totalExpensesElement.textContent = this.formatCurrency(totals.expensesUSD, 'USD');
        }
    }

    loadRecentTransactions(data) {
        const recentTransactionsElement = document.getElementById('recentTransactions');
        if (!recentTransactionsElement) return;

        let allTransactions = [];

        // Combine all transactions
        if (data.capital) {
            allTransactions = allTransactions.concat(
                data.capital.map(t => ({ ...t, type: 'رأس مال' }))
            );
        }
        if (data.expenses) {
            allTransactions = allTransactions.concat(
                data.expenses.map(t => ({ ...t, type: 'مصروف' }))
            );
        }

        // Sort by date (most recent first)
        allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Take only the last 5 transactions
        const recentTransactions = allTransactions.slice(0, 5);

        if (recentTransactions.length === 0) {
            recentTransactionsElement.innerHTML = '<p class="text-muted text-center">لا توجد عمليات حديثة</p>';
            return;
        }

        const tableHTML = `
            <table class="table table-hover">
                <thead>
                    <tr>
                        <th>النوع</th>
                        <th>المبلغ</th>
                        <th>العملة</th>
                        <th>التاريخ</th>
                        <th>الوصف</th>
                    </tr>
                </thead>
                <tbody>
                    ${recentTransactions.map(transaction => `
                        <tr>
                            <td><span class="badge bg-${transaction.type === 'رأس مال' ? 'success' : 'danger'}">${transaction.type}</span></td>
                            <td>${this.formatCurrency(transaction.amount, transaction.currency)}</td>
                            <td>${transaction.currency}</td>
                            <td>${this.formatDate(transaction.date)}</td>
                            <td>${transaction.description || transaction.notes || '-'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        recentTransactionsElement.innerHTML = tableHTML;
    }

    formatCurrency(amount, currency) {
        const num = parseFloat(amount) || 0;
        if (currency === 'USD') {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
            }).format(num);
        } else {
            return new Intl.NumberFormat('ar-IQ').format(num) + ' د.ع';
        }
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('ar-IQ');
    }

    loadExchangeRate() {
        const savedRate = localStorage.getItem('exchangeRate');
        if (savedRate) {
            this.exchangeRate = parseFloat(savedRate);
        }
    }

    autoSave() {
        // Auto-save current state
        if (this.currentUser) {
            const timestamp = new Date().toISOString();
            localStorage.setItem('lastAutoSave', timestamp);
            console.log('Auto-save completed at:', timestamp);
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show position-fixed`;
        notification.style.cssText = 'top: 20px; left: 20px; z-index: 9999; min-width: 300px;';
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        document.body.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    logout() {
        localStorage.removeItem('currentUser');
        this.currentUser = null;
        this.showLogin();
        this.showNotification('تم تسجيل الخروج بنجاح', 'info');
    }
}

// Global functions for HTML onclick events
function showSection(sectionName) {
    if (window.app) {
        window.app.showSection(sectionName);
    }
}

function logout() {
    if (window.app) {
        window.app.logout();
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new AccountingApp();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AccountingApp;
}
