// Expenses Management System
class ExpensesManager {
    constructor() {
        this.currentView = 'overview';
        this.editingId = null;
        this.lastSavedEntry = null;
        this.editingGuideId = null;
        this.init();
    }

    init() {
        console.log('ExpensesManager init called');
        this.loadExpensesSection();
        // Initialize accounting guide
        this.initializeDefaultAccountingGuide();
        console.log('ExpensesManager init completed');
    }

    // Load the expenses section content
    loadExpensesSection() {
        const expensesSection = document.getElementById('expensesSection');
        if (!expensesSection) return;

        const expensesHTML = `
            <div class="expenses-container">
                <!-- Expenses Navigation -->
                <div class="expenses-nav neumorphic-card mb-4">
                    <div class="row">
                        <div class="col-12">
                            <ul class="nav nav-pills justify-content-center">
                                <li class="nav-item">
                                    <a class="nav-link active" href="#" onclick="expensesManager.showView('overview')">
                                        <i class="bi bi-speedometer2 me-2"></i>نظرة عامة
                                    </a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link" href="#" onclick="expensesManager.showView('add-expense')">
                                        <i class="bi bi-plus-circle me-2"></i>إضافة مصروف
                                    </a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link" href="#" onclick="expensesManager.showView('categories')">
                                        <i class="bi bi-tags me-2"></i>فئات المصروفات
                                    </a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link" href="#" onclick="expensesManager.showView('edit-expenses')">
                                        <i class="bi bi-pencil-square me-2"></i>تعديل المصروفات
                                    </a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link" href="#" onclick="expensesManager.showView('search')">
                                        <i class="bi bi-search me-2"></i>البحث
                                    </a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link" href="#" onclick="expensesManager.showView('accounting-guide')">
                                        <i class="bi bi-book me-2"></i>الدليل المحاسبي
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <!-- Expenses Content Views -->
                <div id="expensesContent">
                    <!-- Content will be loaded here -->
                </div>
            </div>
        `;

        expensesSection.innerHTML = expensesHTML;
        this.showView('overview');
    }

    // Show specific view
    showView(viewName) {
        this.currentView = viewName;
        
        // Update navigation
        const navLinks = document.querySelectorAll('.expenses-nav .nav-link');
        navLinks.forEach(link => link.classList.remove('active'));
        
        const activeLink = document.querySelector(`[onclick="expensesManager.showView('${viewName}')"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }

        // Load view content
        switch (viewName) {
            case 'overview':
                this.loadOverviewView();
                break;
            case 'add-expense':
                this.loadAddExpenseView();
                break;
            case 'categories':
                this.loadCategoriesView();
                break;
            case 'edit-expenses':
                this.loadEditExpensesView();
                break;
            case 'search':
                this.loadSearchView();
                break;
            case 'accounting-guide':
                console.log('Loading accounting guide view...');
                this.loadAccountingGuideView();
                break;
        }
    }

    // Helper: render recent expenses list (used in both overview and add views)
    renderRecentExpensesList(expenses) {
        if (!Array.isArray(expenses) || expenses.length === 0) {
            return '<p class="text-center text-muted">لا توجد مصروفات حديثة</p>';
        }
        const sorted = expenses.slice().sort((a, b) => (new Date(b.date)) - (new Date(a.date)));
        return `
            <ul class="list-group">
                ${sorted.slice(0, 5).map(exp => `
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        <span>${exp.description || 'بدون وصف'}<br><small class="text-muted">${new Date(exp.date).toLocaleDateString('ar-IQ')}</small></span>
                        <span class="badge bg-secondary">${this.formatCurrency(exp.amount || exp.amountUSD || exp.amountIQD || 0, exp.currency || (exp.amountUSD ? 'USD' : 'IQD'))}</span>
                    </li>
                `).join('')}
            </ul>
        `;
    }

    // Load overview view
    loadOverviewView() {
        const data = StorageManager.getAllData();
        const expenseStats = this.calculateExpenseStats(data);

        const overviewHTML = `
            <div class="row">
                <!-- Expense Statistics -->
                <div class="col-lg-8 mb-4">
                    <div class="neumorphic-card">
                        <div class="card-header">
                            <h4><i class="bi bi-graph-down me-2"></i>إحصائيات المصروفات</h4>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <div class="stat-item">
                                        <div class="stat-icon bg-danger">
                                            <i class="bi bi-currency-dollar"></i>
                                        </div>
                                        <div class="stat-details">
                                            <h3>${this.formatCurrency(expenseStats.totalUSD, 'USD')}</h3>
                                            <p>إجمالي المصروفات بالدولار</p>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <div class="stat-item">
                                        <div class="stat-icon bg-warning">
                                            <i class="bi bi-cash"></i>
                                        </div>
                                        <div class="stat-details">
                                            <h3>${this.formatCurrency(expenseStats.totalIQD, 'IQD')}</h3>
                                            <p>إجمالي المصروفات بالدينار</p>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <div class="stat-item">
                                        <div class="stat-icon bg-info">
                                            <i class="bi bi-receipt"></i>
                                        </div>
                                        <div class="stat-details">
                                            <h3>${expenseStats.totalExpenses}</h3>
                                            <p>عدد المصروفات</p>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <div class="stat-item">
                                        <div class="stat-icon bg-secondary">
                                            <i class="bi bi-tags"></i>
                                        </div>
                                        <div class="stat-details">
                                            <h3>${expenseStats.totalCategories}</h3>
                                            <p>فئات المصروفات</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Recent Expenses -->
                <div class="col-lg-4 mb-4">
                    <div class="neumorphic-card">
                        <div class="card-header">
                            <h5><i class="bi bi-clock-history me-2"></i>آخر المصروفات</h5>
                        </div>
                        <div class="card-body">
                            <div id="recentExpenses">
                                ${this.renderRecentExpensesList(data.expenses || [])}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Expenses by Category -->
                <div class="col-12">
                    <div class="neumorphic-card">
                        <div class="card-header">
                            <h4><i class="bi bi-pie-chart me-2"></i>المصروفات حسب الفئة</h4>
                        </div>
                        <div class="card-body">
                            <div id="expensesByCategory">
                                ${this.renderExpensesByCategory(data)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('expensesContent').innerHTML = overviewHTML;
    }

    // Load add expense view
    loadAddExpenseView() {
        const categories = this.getExpenseCategories();

        const addExpenseHTML = `
            <div class="neumorphic-card">
                <div class="card-header">
                    <h4><i class="bi bi-plus-circle me-2"></i>إضافة مصروف جديد</h4>
                </div>
                <div class="card-body">
                    <form id="expenseForm" class="row">
                        <!-- رقم القيد والتاريخ -->
                        <div class="col-md-6 mb-3">
                            <label for="expenseRegistrationNumber" class="form-label">
                                <i class="bi bi-hash me-1"></i>رقم القيد
                            </label>
                            <input type="text" class="form-control neumorphic-input" id="expenseRegistrationNumber"
                                   value="${StorageManager.generateRegistrationNumber()}" readonly>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="expenseDate" class="form-label">
                                <i class="bi bi-calendar me-1"></i>التاريخ
                            </label>
                            <input type="date" class="form-control neumorphic-input" id="expenseDate"
                                   value="${new Date().toISOString().split('T')[0]}" required>
                        </div>

                        <!-- المبالغ وسعر الصرف -->
                        <div class="col-md-4 mb-3">
                            <label for="expenseAmountIQD" class="form-label">
                                <i class="bi bi-cash me-1"></i>المبلغ بالدينار
                            </label>
                            <input type="number" class="form-control neumorphic-input" id="expenseAmountIQD"
                                   step="1" min="0" placeholder="0" onchange="expensesManager.calculateCurrency('IQD')">
                            <small class="text-muted">أدخل بالدينار بشكل مستقل. لن يتم التغيير تلقائياً إلا إذا فعّلت التحويل.</small>
                        </div>
                        <div class="col-md-4 mb-3">
                            <label for="expenseAmountUSD" class="form-label">
                                <i class="bi bi-currency-dollar me-1"></i>المبلغ بالدولار
                            </label>
                            <input type="number" class="form-control neumorphic-input" id="expenseAmountUSD"
                                   step="0.01" min="0" placeholder="0.00" onchange="expensesManager.calculateCurrency('USD')">
                            <small class="text-muted">أدخل بالدولار بشكل مستقل. لن يتم التغيير تلقائياً إلا إذا فعّلت التحويل.</small>
                        </div>
                        <div class="col-md-4 mb-3">
                            <label for="expenseExchangeRate" class="form-label">
                                <i class="bi bi-arrow-left-right me-1"></i>سعر الصرف
                            </label>
                            <input type="number" class="form-control neumorphic-input" id="expenseExchangeRate"
                                   step="0.01" min="0" value="1500" placeholder="1500" onchange="expensesManager.calculateCurrency()">
                            <div class="form-check mt-2">
                                <input class="form-check-input" type="checkbox" id="enableAutoConversion" onchange="expensesManager.calculateCurrency()">
                                <label class="form-check-label" for="enableAutoConversion">تفعيل التحويل التلقائي بين الدينار والدولار</label>
                            </div>
                        </div>

                        <!-- البيان والدليل المحاسبي -->
                        <div class="col-md-6 mb-3">
                            <label for="expenseDescription" class="form-label">
                                <i class="bi bi-file-text me-1"></i>البيان
                            </label>
                            <input type="text" class="form-control neumorphic-input" id="expenseDescription"
                                   placeholder="بيان المصروف..." required>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="expenseAccountingGuide" class="form-label">
                                <i class="bi bi-book me-1"></i>الدليل المحاسبي
                            </label>
                            <select class="form-control neumorphic-input" id="expenseAccountingGuide" required>
                                <option value="">اختر من الدليل المحاسبي</option>
                                ${this.getAccountingGuideOptions()}
                            </select>
                        </div>

                        <!-- المستفيد ومعلومات الوصل -->
                        <div class="col-md-4 mb-3">
                            <label for="expenseBeneficiary" class="form-label">
                                <i class="bi bi-person me-1"></i>المستفيد
                            </label>
                            <input type="text" class="form-control neumorphic-input" id="expenseBeneficiary"
                                   placeholder="اسم المستفيد...">
                        </div>
                        <div class="col-md-4 mb-3">
                            <label for="expenseReceiptNumber" class="form-label">
                                <i class="bi bi-receipt me-1"></i>رقم الوصل
                            </label>
                            <input type="text" class="form-control neumorphic-input" id="expenseReceiptNumber"
                                   placeholder="رقم الوصل...">
                        </div>
                        <div class="col-md-4 mb-3">
                            <label for="expenseReceiptDate" class="form-label">
                                <i class="bi bi-calendar-check me-1"></i>تاريخ الوصل
                            </label>
                            <input type="date" class="form-control neumorphic-input" id="expenseReceiptDate">
                        </div>

                        <!-- معلومات إضافية -->
                        <div class="col-md-6 mb-3">
                            <label for="expenseVendor" class="form-label">
                                <i class="bi bi-building me-1"></i>المورد/الجهة
                            </label>
                            <input type="text" class="form-control neumorphic-input" id="expenseVendor"
                                   placeholder="اسم المورد أو الجهة...">
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="expensePaymentMethod" class="form-label">
                                <i class="bi bi-credit-card me-1"></i>طريقة الدفع
                            </label>
                            <select class="form-control neumorphic-input" id="expensePaymentMethod">
                                <option value="">اختر طريقة الدفع</option>
                                <option value="cash">نقداً</option>
                                <option value="bank_transfer">تحويل بنكي</option>
                                <option value="check">شيك</option>
                                <option value="credit_card">بطاقة ائتمان</option>
                                <option value="electronic_payment">دفع إلكتروني</option>
                            </select>
                        </div>

                        <!-- الفئة والمشروع -->
                        <div class="col-md-6 mb-3">
                            <label for="expenseCategory" class="form-label">
                                <i class="bi bi-tags me-1"></i>فئة المصروف
                            </label>
                            <select class="form-control neumorphic-input" id="expenseCategory" required>
                                <option value="">اختر الفئة</option>
                                ${categories.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
                            </select>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="expenseProject" class="form-label">
                                <i class="bi bi-diagram-3 me-1"></i>المشروع
                            </label>
                            <select class="form-control neumorphic-input" id="expenseProject">
                                <option value="">اختر المشروع</option>
                                <option value="مشروع 1">مشروع البناء الرئيسي</option>
                                <option value="مشروع 2">مشروع التوسعة</option>
                                <option value="مشروع 3">مشروع الصيانة</option>
                                <option value="عام">مصروف عام</option>
                            </select>
                        </div>

                        <!-- الملاحظات -->
                        <div class="col-12 mb-3">
                            <label for="expenseNotes" class="form-label">
                                <i class="bi bi-chat-text me-1"></i>الملاحظات
                            </label>
                            <textarea class="form-control neumorphic-input" id="expenseNotes" rows="3"
                                      placeholder="ملاحظات إضافية حول المصروف..."></textarea>
                        </div>

                        <!-- أزرار التحكم -->
                        <div class="col-12">
                            <div class="d-flex flex-wrap gap-2">
                                <button type="submit" class="btn btn-primary neumorphic-btn">
                                    <i class="bi bi-save me-2"></i>حفظ المصروف
                                </button>
                                <button type="reset" class="btn btn-secondary neumorphic-btn">
                                    <i class="bi bi-arrow-clockwise me-2"></i>إعادة تعيين
                                </button>
                                <button type="button" class="btn btn-info neumorphic-btn" onclick="expensesManager.previewExpense()">
                                    <i class="bi bi-eye me-2"></i>معاينة
                                </button>
                                <button type="button" class="btn btn-warning neumorphic-btn" onclick="expensesManager.printInvoice()">
                                    <i class="bi bi-printer me-2"></i>طباعة الفاتورة
                                </button>
                                <button type="button" class="btn btn-success neumorphic-btn" onclick="expensesManager.fillTestData()">
                                    <i class="bi bi-clipboard-data me-2"></i>بيانات تجريبية
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            <!-- معاينة المصروف -->
            <div id="expensePreview" class="neumorphic-card mt-4" style="display: none;">
                <div class="card-header">
                    <h5><i class="bi bi-eye me-2"></i>معاينة المصروف</h5>
                </div>
                <div class="card-body" id="expensePreviewContent">
                    <!-- Preview content will be loaded here -->
                </div>
            </div>

            <!-- Recent Expenses List -->
            <div class="neumorphic-card mt-4">
                <div class="card-header">
                    <h4><i class="bi bi-list me-2"></i>المصروفات الحديثة</h4>
                </div>
                <div class="card-body">
                    <div id="expensesList">
                        ${this.renderRecentExpenses(StorageManager.getAllData().expenses || [])}
                    </div>
                </div>
            </div>
        `;

        document.getElementById('expensesContent').innerHTML = addExpenseHTML;
        this.setupExpenseForm();
    }

    // Load accounting guide view
    loadAccountingGuideView() {
        console.log('Loading accounting guide view...');

        const expensesContent = document.getElementById('expensesContent');
        if (!expensesContent) {
            console.error('expensesContent element not found!');
            return;
        }

        // Initialize default guide first
        this.initializeDefaultAccountingGuide();

        const accountingGuideHTML = `
            <div class="accounting-guide-container">
                <!-- Guide Navigation -->
                <div class="neumorphic-card mb-4">
                    <div class="card-header">
                        <h4><i class="bi bi-book me-2"></i>الدليل المحاسبي للمصروفات</h4>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-4 mb-3">
                                <button class="btn btn-primary neumorphic-btn w-100" onclick="expensesManager.showGuideSubView('add')">
                                    <i class="bi bi-plus-circle me-2"></i>إضافة دليل محاسبي
                                </button>
                            </div>
                            <div class="col-md-4 mb-3">
                                <button class="btn btn-warning neumorphic-btn w-100" onclick="expensesManager.showGuideSubView('edit')">
                                    <i class="bi bi-pencil-square me-2"></i>تعديل دليل محاسبي
                                </button>
                            </div>
                            <div class="col-md-4 mb-3">
                                <button class="btn btn-success neumorphic-btn w-100" onclick="expensesManager.showGuideSubView('print')">
                                    <i class="bi bi-printer me-2"></i>طباعة الدليل
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Guide Content -->
                <div id="guideContent">
                    <div class="text-center">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">جاري التحميل...</span>
                        </div>
                        <p class="mt-2">جاري تحميل الدليل المحاسبي...</p>
                    </div>
                </div>
            </div>
        `;

        console.log('Setting accounting guide HTML...');
        expensesContent.innerHTML = accountingGuideHTML;

        // Load content after a short delay to ensure DOM is ready
        setTimeout(() => {
            console.log('Loading guide overview...');
            this.showGuideSubView('overview');
        }, 100);
    }

    // Show guide sub-view
    showGuideSubView(subView) {
        console.log('Showing guide sub-view:', subView);
        const guideContent = document.getElementById('guideContent');
        if (!guideContent) {
            console.error('Guide content element not found');
            return;
        }

        switch (subView) {
            case 'add':
                guideContent.innerHTML = this.renderAddGuideForm();
                this.setupAddGuideForm();
                break;
            case 'edit':
                guideContent.innerHTML = this.renderEditGuideList();
                break;
            case 'print':
                this.printAccountingGuide();
                break;
            case 'overview':
            default:
                guideContent.innerHTML = this.renderAccountingGuideOverview();
                break;
        }
    }

    // Render accounting guide overview
    renderAccountingGuideOverview() {
        console.log('Rendering accounting guide overview...');

        // Get accounting guide data
        let accountingGuide = StorageManager.getData(StorageManager.STORAGE_KEYS.ACCOUNTING_GUIDE) || [];
        console.log('Accounting guide data length:', accountingGuide.length);

        // If no data, try to create default guide
        if (accountingGuide.length === 0) {
            console.log('No accounting guide found, creating default...');

            // Create default guide directly
            const defaultGuide = this.getDefaultAccountingGuide();
            console.log('Default guide created with', defaultGuide.length, 'items');

            // Save it
            const saved = StorageManager.saveData(StorageManager.STORAGE_KEYS.ACCOUNTING_GUIDE, defaultGuide);
            console.log('Default guide saved:', saved);

            if (saved) {
                accountingGuide = defaultGuide;
            }
        }

        // If still no data, show empty state
        if (accountingGuide.length === 0) {
            console.log('Still no accounting guide data, showing empty state');
            return `
                <div class="neumorphic-card">
                    <div class="card-body text-center">
                        <i class="bi bi-book display-1 text-muted"></i>
                        <h4 class="mt-3">لا يوجد دليل محاسبي</h4>
                        <p class="text-muted">ابدأ بإضافة عناصر الدليل المحاسبي للمصروفات</p>
                        <button class="btn btn-primary neumorphic-btn" onclick="expensesManager.createDefaultGuide()">
                            <i class="bi bi-plus-circle me-2"></i>إنشاء الدليل الافتراضي
                        </button>
                        <button class="btn btn-success neumorphic-btn ms-2" onclick="expensesManager.showGuideSubView('add')">
                            <i class="bi bi-plus-circle me-2"></i>إضافة عنصر يدوياً
                        </button>
                    </div>
                </div>
            `;
        }

        console.log('Rendering guide with', accountingGuide.length, 'items');

        // Group by main categories
        const groupedGuide = this.groupAccountingGuideByCategory(accountingGuide);

        let overviewHTML = `
            <div class="neumorphic-card">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h5><i class="bi bi-list-ul me-2"></i>الدليل المحاسبي الحالي</h5>
                    <span class="badge bg-info">${accountingGuide.length} عنصر</span>
                </div>
                <div class="card-body">
        `;

        Object.keys(groupedGuide).forEach(category => {
            overviewHTML += `
                <div class="category-section mb-4">
                    <h6 class="category-title">
                        <i class="bi bi-folder me-2"></i>${category}
                        <span class="badge bg-secondary ms-2">${groupedGuide[category].length}</span>
                    </h6>
                    <div class="row">
            `;

            groupedGuide[category].forEach(item => {
                overviewHTML += `
                    <div class="col-md-6 col-lg-4 mb-3">
                        <div class="guide-item p-3 border rounded">
                            <div class="d-flex justify-content-between align-items-start">
                                <div>
                                    <strong>${item.code}</strong>
                                    <div class="text-muted small">${item.name}</div>
                                    ${item.description ? `<div class="text-muted small mt-1">${item.description}</div>` : ''}
                                </div>
                                <div class="btn-group btn-group-sm">
                                    <button class="btn btn-outline-primary" onclick="expensesManager.editGuideItem('${item.id}')" title="تعديل">
                                        <i class="bi bi-pencil"></i>
                                    </button>
                                    <button class="btn btn-outline-danger" onclick="expensesManager.deleteGuideItem('${item.id}')" title="حذف">
                                        <i class="bi bi-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            });

            overviewHTML += `
                    </div>
                </div>
            `;
        });

        overviewHTML += `
                </div>
            </div>
        `;

        return overviewHTML;
    }

    // Render expenses by category (summary with totals and drilldown)
    renderExpensesByCategory(data = null) {
        const expenses = (data?.expenses) || StorageManager.getAllData().expenses || [];

        if (expenses.length === 0) {
            return '<p class="text-center text-muted">لا توجد مصروفات لعرضها</p>';
        }

        // Group expenses by category
        const grouped = {};
        expenses.forEach(expense => {
            const category = expense.category || 'غير مصنف';
            if (!grouped[category]) grouped[category] = [];
            grouped[category].push(expense);
        });

        let html = '<div class="row">';
        Object.keys(grouped).forEach(category => {
            const categoryExpenses = grouped[category];
            const totals = categoryExpenses.reduce((acc, exp) => {
                const { iqd, usd } = this.getExpenseAmounts(exp);
                acc.count += 1;
                acc.iqd += iqd;
                acc.usd += usd;
                return acc;
            }, { count: 0, iqd: 0, usd: 0 });

            const catEsc = category.replace(/'/g, "\\'");

            html += `
                <div class="col-lg-4 col-md-6 mb-3">
                    <div class="card h-100" role="button" onclick="expensesManager.showCategoryDetails('${catEsc}')">
                        <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                            <h6 class="mb-0">${category}</h6>
                            <span class="badge bg-light text-dark">${totals.count}</span>
                        </div>
                        <div class="card-body">
                            <div class="d-flex justify-content-between">
                                <div>
                                    <div class="text-muted small">الإجمالي بالدينار</div>
                                    <div><strong>${this.formatCurrency(totals.iqd, 'IQD')}</strong></div>
                                </div>
                                <div class="text-end">
                                    <div class="text-muted small">الإجمالي بالدولار</div>
                                    <div><strong>${this.formatCurrency(totals.usd, 'USD')}</strong></div>
                                </div>
                            </div>
                            <hr>
                            <div class="list-group list-group-flush">
                                ${categoryExpenses.slice(0, 3).map(exp => {
                                    const { iqd, usd } = this.getExpenseAmounts(exp);
                                    const amountText = usd > 0 ? this.formatCurrency(usd, 'USD') : this.formatCurrency(iqd, 'IQD');
                                    return `
                                        <div class="list-group-item d-flex justify-content-between">
                                            <small>${exp.description || 'بدون وصف'}</small>
                                            <small class="text-muted">${amountText}</small>
                                        </div>
                                    `;
                                }).join('')}
                                ${categoryExpenses.length > 3 ? `<div class="list-group-item text-center"><small>و ${categoryExpenses.length - 3} مصروف آخر...</small></div>` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        html += '</div>';

        return html;
    }

    // Helper: normalize expense amounts to separate IQD/USD
    getExpenseAmounts(expense) {
        const iqd = (parseFloat(expense.amountIQD) || 0) + ((expense.currency === 'IQD') ? (parseFloat(expense.amount) || 0) : 0);
        const usd = (parseFloat(expense.amountUSD) || 0) + ((expense.currency === 'USD') ? (parseFloat(expense.amount) || 0) : 0);
        return { iqd, usd };
    }

    // Load categories view (simple summary only)
    loadCategoriesView() {
        const data = StorageManager.getAllData();
        const content = `
            <div class="neumorphic-card">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h4 class="mb-0"><i class="bi bi-tags me-2"></i>فئات المصروفات</h4>
                </div>
                <div class="card-body">
                    ${this.renderExpensesByCategory(data)}
                </div>
            </div>
        `;
        document.getElementById('expensesContent').innerHTML = content;
    }

    // (Removed) Filters and chart helpers for categories view
    // getFilteredExpensesForCategories, applyCategoryFilters, resetCategoryFilters,
    // renderCategoriesBarChart, exportCategoriesCSV, exportCategoriesJSON were removed as requested.

    // Drilldown: show category details (simple view without filters/export)
    showCategoryDetails(category) {
        this.currentCategory = category;
        const all = StorageManager.getAllData().expenses || [];
        const filtered = all.filter(e => (e.category || 'غير مصنف') === category);

        if (filtered.length === 0) {
            document.getElementById('expensesContent').innerHTML = `<div class="neumorphic-card"><div class="card-header"><button class="btn btn-sm btn-secondary me-2" onclick=\"expensesManager.loadCategoriesView()\"><i class=\"bi bi-arrow-right\"></i> رجوع</button> ${category}</div><div class=\"card-body\"><div class=\"alert alert-info\">لا توجد قيود ضمن هذه الفئة</div></div></div>`;
            return;
        }

        const totals = filtered.reduce((acc, exp) => {
            const { iqd, usd } = this.getExpenseAmounts(exp);
            acc.iqd += iqd; acc.usd += usd; return acc;
        }, { iqd: 0, usd: 0 });

        const rows = filtered.map(e => {
            const { iqd, usd } = this.getExpenseAmounts(e);
            return `
                <tr>
                    <td>${this.formatDate(e.date)}</td>
                    <td>${e.registrationNumber || '-'}</td>
                    <td>${e.description || '-'}</td>
                    <td>${iqd ? this.formatCurrency(iqd, 'IQD') : '-'}</td>
                    <td>${usd ? this.formatCurrency(usd, 'USD') : '-'}</td>
                    <td>${e.exchangeRate || '-'}</td>
                    <td>${this.getPaymentMethodText?.(e.paymentMethod) || '-'}</td>
                    <td>${e.project || '-'}</td>
                    <td>${e.vendor || '-'}</td>
                </tr>
            `;
        }).join('');

        const html = `
            <div class="neumorphic-card">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <div>
                        <button class="btn btn-sm btn-secondary me-2" onclick="expensesManager.loadCategoriesView()"><i class="bi bi-arrow-right"></i> رجوع</button>
                        <strong><i class="bi bi-folder2-open me-2"></i>${category}</strong>
                    </div>
                </div>
                <div class="card-body">
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <div class="p-3 border rounded">
                                <div class="text-muted small">إجمالي بالدينار</div>
                                <div class="fs-5">${this.formatCurrency(totals.iqd, 'IQD')}</div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="p-3 border rounded text-end">
                                <div class="text-muted small">إجمالي بالدولار</div>
                                <div class="fs-5">${this.formatCurrency(totals.usd, 'USD')}</div>
                            </div>
                        </div>
                    </div>

                    <div class="table-responsive">
                        <table class="table table-striped">
                            <thead>
                                <tr>
                                    <th>التاريخ</th>
                                    <th>رقم القيد</th>
                                    <th>البيان</th>
                                    <th>المبلغ (د.ع)</th>
                                    <th>المبلغ ($)</th>
                                    <th>سعر الصرف</th>
                                    <th>طريقة الدفع</th>
                                    <th>المشروع</th>
                                    <th>المورد</th>
                                </tr>
                            </thead>
                            <tbody>${rows}</tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('expensesContent').innerHTML = html;
    }

    // Filtering for category details
    filterCategoryDetails(category) {
        const all = StorageManager.getAllData().expenses || [];
        const from = document.getElementById('dfltFrom')?.value;
        const to = document.getElementById('dfltTo')?.value;
        const project = (document.getElementById('dfltProject')?.value || '').trim().toLowerCase();
        const payment = document.getElementById('dfltPayment')?.value || '';
        return all.filter(e => {
            if ((e.category || 'غير مصنف') !== category) return false;
            const d = e.date ? new Date(e.date) : null;
            if (from && d && d < new Date(from)) return false;
            if (to && d && d > new Date(to)) return false;
            if (project && (e.project || '').toLowerCase().indexOf(project) === -1) return false;
            if (payment && e.paymentMethod !== payment) return false;
            return true;
        });
    }

    applyCategoryDetailFilters() {
        this.showCategoryDetails(this.currentCategory);
    }

    resetCategoryDetailFilters() {
        document.getElementById('dfltFrom').value = '';
        document.getElementById('dfltTo').value = '';
        document.getElementById('dfltProject').value = '';
        document.getElementById('dfltPayment').value = '';
        this.applyCategoryDetailFilters();
    }

    // CSV export for one category (details)
    exportCategoryCSV(category) {
        const rows = [['التاريخ','رقم القيد','البيان','المبلغ (د.ع)','المبلغ ($)','سعر الصرف','طريقة الدفع','المشروع','المورد']];
        const data = this.filterCategoryDetails(category);
        data.forEach(e => {
            const { iqd, usd } = this.getExpenseAmounts(e);
            rows.push([
                this.formatDate(e.date),
                e.registrationNumber || '-',
                e.description || '-',
                iqd || 0,
                usd || 0,
                e.exchangeRate || '-',
                this.getPaymentMethodText?.(e.paymentMethod) || '-',
                e.project || '-',
                e.vendor || '-'
            ]);
        });
        const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `category_${category}_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    }

    // Export selected category as JSON
    exportCategory(category) {
        const expenses = StorageManager.getAllData().expenses || [];
        const filtered = expenses.filter(e => (e.category || 'غير مصنف') === category);
        const blob = new Blob([JSON.stringify({ category, items: filtered }, null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `expenses_${category}_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
    }

    // Group accounting guide by category
    groupAccountingGuideByCategory(guide) {
        const grouped = {};
        guide.forEach(item => {
            const category = item.category || 'غير مصنف';
            if (!grouped[category]) {
                grouped[category] = [];
            }
            grouped[category].push(item);
        });
        return grouped;
    }

    // Render add guide form
    renderAddGuideForm() {
        return `
            <div class="neumorphic-card">
                <div class="card-header">
                    <h5><i class="bi bi-plus-circle me-2"></i>إضافة عنصر جديد للدليل المحاسبي</h5>
                </div>
                <div class="card-body">
                    <form id="addGuideForm" class="row">
                        <div class="col-md-6 mb-3">
                            <label for="guideCode" class="form-label">رمز الحساب</label>
                            <input type="text" class="form-control neumorphic-input" id="guideCode"
                                   placeholder="مثال: 5101" required>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="guideName" class="form-label">اسم الحساب</label>
                            <input type="text" class="form-control neumorphic-input" id="guideName"
                                   placeholder="مثال: مواد البناء الأساسية" required>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="guideCategory" class="form-label">الفئة الرئيسية</label>
                            <select class="form-control neumorphic-input" id="guideCategory" required>
                                <option value="">اختر الفئة</option>
                                <option value="مواد البناء">مواد البناء</option>
                                <option value="العمالة">العمالة</option>
                                <option value="المعدات والآلات">المعدات والآلات</option>
                                <option value="النقل والمواصلات">النقل والمواصلات</option>
                                <option value="الوقود والطاقة">الوقود والطاقة</option>
                                <option value="الصيانة والإصلاح">الصيانة والإصلاح</option>
                                <option value="الرواتب والأجور">الرواتب والأجور</option>
                                <option value="التأمين">التأمين</option>
                                <option value="الضرائب والرسوم">الضرائب والرسوم</option>
                                <option value="المكتب والإدارة">المكتب والإدارة</option>
                                <option value="التسويق والإعلان">التسويق والإعلان</option>
                                <option value="الاستشارات المهنية">الاستشارات المهنية</option>
                                <option value="أخرى">أخرى</option>
                            </select>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="guideType" class="form-label">نوع الحساب</label>
                            <select class="form-control neumorphic-input" id="guideType" required>
                                <option value="">اختر النوع</option>
                                <option value="مصروف مباشر">مصروف مباشر</option>
                                <option value="مصروف غير مباشر">مصروف غير مباشر</option>
                                <option value="مصروف إداري">مصروف إداري</option>
                                <option value="مصروف تشغيلي">مصروف تشغيلي</option>
                            </select>
                        </div>
                        <div class="col-12 mb-3">
                            <label for="guideDescription" class="form-label">وصف الحساب</label>
                            <textarea class="form-control neumorphic-input" id="guideDescription" rows="3"
                                      placeholder="وصف تفصيلي للحساب واستخداماته..."></textarea>
                        </div>
                        <div class="col-12 mb-3">
                            <label for="guideNotes" class="form-label">ملاحظات</label>
                            <textarea class="form-control neumorphic-input" id="guideNotes" rows="2"
                                      placeholder="ملاحظات إضافية..."></textarea>
                        </div>
                        <div class="col-12">
                            <button type="submit" class="btn btn-primary neumorphic-btn">
                                <i class="bi bi-save me-2"></i>حفظ العنصر
                            </button>
                            <button type="button" class="btn btn-secondary neumorphic-btn ms-2" onclick="expensesManager.showGuideSubView('overview')">
                                <i class="bi bi-arrow-right me-2"></i>العودة للعرض العام
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    }

    // Render edit guide list
    renderEditGuideList() {
        const accountingGuide = StorageManager.getData(StorageManager.STORAGE_KEYS.ACCOUNTING_GUIDE) || [];

        if (accountingGuide.length === 0) {
            return `
                <div class="neumorphic-card">
                    <div class="card-body text-center">
                        <i class="bi bi-exclamation-triangle display-1 text-warning"></i>
                        <h4 class="mt-3">لا يوجد عناصر للتعديل</h4>
                        <p class="text-muted">يجب إضافة عناصر للدليل المحاسبي أولاً</p>
                        <button class="btn btn-primary neumorphic-btn" onclick="expensesManager.showGuideSubView('add')">
                            <i class="bi bi-plus-circle me-2"></i>إضافة عنصر جديد
                        </button>
                    </div>
                </div>
            `;
        }

        return `
            <div class="neumorphic-card">
                <div class="card-header">
                    <h5><i class="bi bi-pencil-square me-2"></i>تعديل عناصر الدليل المحاسبي</h5>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead>
                                <tr>
                                    <th>رمز الحساب</th>
                                    <th>اسم الحساب</th>
                                    <th>الفئة</th>
                                    <th>النوع</th>
                                    <th>الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${accountingGuide.map(item => `
                                    <tr>
                                        <td><strong>${item.code}</strong></td>
                                        <td>${item.name}</td>
                                        <td><span class="badge bg-info">${item.category}</span></td>
                                        <td><span class="badge bg-secondary">${item.type}</span></td>
                                        <td>
                                            <div class="btn-group btn-group-sm">
                                                <button class="btn btn-outline-primary" onclick="expensesManager.editGuideItem('${item.id}')" title="تعديل">
                                                    <i class="bi bi-pencil"></i>
                                                </button>
                                                <button class="btn btn-outline-danger" onclick="expensesManager.deleteGuideItem('${item.id}')" title="حذف">
                                                    <i class="bi bi-trash"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    // Calculate expense statistics
    calculateExpenseStats(data) {
        const stats = {
            totalUSD: 0,
            totalIQD: 0,
            totalExpenses: data.expenses?.length || 0,
            totalCategories: 0
        };

        if (data.expenses) {
            const categories = new Set();
            data.expenses.forEach(expense => {
                const amount = parseFloat(expense.amount) || 0;
                if (expense.currency === 'USD') {
                    stats.totalUSD += amount;
                } else if (expense.currency === 'IQD') {
                    stats.totalIQD += amount;
                }
                if (expense.category) {
                    categories.add(expense.category);
                }
            });
            stats.totalCategories = categories.size;
        }

        return stats;
    }

    // Get expense categories
    getExpenseCategories() {
        return [
            'مواد البناء',
            'العمالة',
            'المعدات والآلات',
            'النقل والمواصلات',
            'الوقود والطاقة',
            'الصيانة والإصلاح',
            'الرواتب والأجور',
            'التأمين',
            'الضرائب والرسوم',
            'المكتب والإدارة',
            'التسويق والإعلان',
            'الاستشارات المهنية',
            'أخرى'
        ];
    }

    // Render recent expenses
    renderRecentExpenses(expenses) {
        if (!expenses || expenses.length === 0) {
            return '<p class="text-muted text-center">لا توجد مصروفات حديثة</p>';
        }

        const recentExpenses = expenses
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5);

        return recentExpenses.map(expense => `
            <div class="recent-expense mb-3 p-3 border rounded">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h6 class="mb-1">${this.formatCurrency(expense.amount, expense.currency)}</h6>
                        <small class="text-muted">${expense.category || 'غير محدد'}</small>
                        <br>
                        <small class="text-muted">${this.formatDate(expense.date)}</small>
                    </div>
                    <span class="badge bg-${expense.currency === 'USD' ? 'danger' : 'warning'}">${expense.currency}</span>
                </div>
            </div>
        `).join('');
    }

    // Utility functions
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

    // Setup expense form
    setupExpenseForm() {
        const form = document.getElementById('expenseForm');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveExpenseEntry();
        });
    }

    // Save expense entry
    saveExpenseEntry() {
        const formData = this.getExpenseFormData();
        if (!formData) return;

        // Get accounting guide item details
        const accountingGuideSelect = document.getElementById('expenseAccountingGuide');
        const selectedOption = accountingGuideSelect.options[accountingGuideSelect.selectedIndex];
        const accountingGuideCode = selectedOption?.getAttribute('data-code') || '';
        const accountingGuideName = selectedOption?.getAttribute('data-name') || '';

        const expenseData = {
            registrationNumber: formData.registrationNumber,
            date: formData.date,
            amountIQD: formData.amountIQD,
            amountUSD: formData.amountUSD,
            exchangeRate: formData.exchangeRate,
            description: formData.description,
            accountingGuide: formData.accountingGuide,
            accountingGuideCode: accountingGuideCode,
            accountingGuideName: accountingGuideName,
            beneficiary: formData.beneficiary,
            receiptNumber: formData.receiptNumber,
            receiptDate: formData.receiptDate,
            vendor: formData.vendor,
            paymentMethod: formData.paymentMethod,
            category: formData.category,
            project: formData.project,
            notes: formData.notes,
            // Legacy fields for compatibility
            currency: formData.amountUSD > 0 ? 'USD' : 'IQD',
            amount: formData.amountUSD > 0 ? formData.amountUSD : formData.amountIQD
        };

        if (this.editingId) {
            // Update existing entry
            if (StorageManager.updateExpenseEntry(this.editingId, expenseData)) {
                this.showNotification('تم تحديث المصروف بنجاح', 'success');
                this.lastSavedEntry = { ...expenseData, id: this.editingId };
                this.showPrintButton();
                this.editingId = null;
            } else {
                this.showNotification('حدث خطأ أثناء تحديث المصروف', 'error');
            }
        } else {
            // Add new entry
            const newEntry = StorageManager.addExpenseEntry(expenseData);
            if (newEntry) {
                this.showNotification('تم إضافة المصروف بنجاح', 'success');
                this.lastSavedEntry = newEntry;
                this.showPrintButton();
            } else {
                this.showNotification('حدث خطأ أثناء إضافة المصروف', 'error');
            }
        }

        // Reset form and refresh view
        document.getElementById('expenseForm').reset();
        document.getElementById('expenseRegistrationNumber').value = StorageManager.generateRegistrationNumber();
        document.getElementById('expenseDate').value = new Date().toISOString().split('T')[0];
        document.getElementById('expenseExchangeRate').value = '1500';

        // Hide preview if shown
        const previewDiv = document.getElementById('expensePreview');
        if (previewDiv) {
            previewDiv.style.display = 'none';
        }

        this.refreshCurrentView();
    }

    // Show print button after successful save
    showPrintButton() {
        const printBtn = document.getElementById('printExpenseReceiptBtn');
        if (printBtn) {
            printBtn.style.display = 'inline-block';
            // Hide button after 30 seconds
            setTimeout(() => {
                printBtn.style.display = 'none';
            }, 30000);
        }
    }

    // Print expense receipt
    printExpenseReceipt() {
        if (!this.lastSavedEntry) {
            this.showNotification('لا يوجد مصروف للطباعة', 'error');
            return;
        }

        const receiptHTML = this.generateExpenseReceiptHTML(this.lastSavedEntry);

        // Create print window
        const printWindow = window.open('', '_blank', 'width=800,height=600');
        printWindow.document.write(receiptHTML);
        printWindow.document.close();

        // Wait for content to load then print
        printWindow.onload = function() {
            printWindow.print();
        };
    }

    // Generate expense receipt HTML
    generateExpenseReceiptHTML(entry) {
        const currentDate = new Date().toLocaleDateString('ar-IQ');
        const currentTime = new Date().toLocaleTimeString('ar-IQ');

        // Get payment method in Arabic
        const paymentMethods = {
            'cash': 'نقداً',
            'bank_transfer': 'تحويل بنكي',
            'check': 'شيك',
            'credit_card': 'بطاقة ائتمان'
        };
        const paymentMethodArabic = paymentMethods[entry.paymentMethod] || entry.paymentMethod || 'غير محدد';

        return `
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>إيصال مصروف - ${entry.registrationNumber}</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    margin: 0;
                    padding: 20px;
                    background: white;
                    color: #333;
                    direction: rtl;
                    line-height: 1.6;
                }
                .receipt-container {
                    max-width: 800px;
                    margin: 0 auto;
                    border: 2px solid #333;
                    padding: 30px;
                    background: white;
                }
                .header {
                    text-align: center;
                    border-bottom: 3px double #333;
                    padding-bottom: 20px;
                    margin-bottom: 30px;
                }
                .company-name {
                    font-size: 28px;
                    font-weight: bold;
                    color: #2c3e50;
                    margin-bottom: 10px;
                }
                .receipt-title {
                    font-size: 24px;
                    color: #e74c3c;
                    font-weight: bold;
                    margin-bottom: 10px;
                }
                .receipt-number {
                    font-size: 18px;
                    color: #7f8c8d;
                }
                .receipt-body {
                    margin: 30px 0;
                }
                .info-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 15px;
                    padding: 10px;
                    background: #f8f9fa;
                    border-radius: 5px;
                }
                .info-label {
                    font-weight: bold;
                    color: #2c3e50;
                    min-width: 150px;
                }
                .info-value {
                    color: #34495e;
                    flex: 1;
                    text-align: left;
                }
                .amount-section {
                    background: #ffe8e8;
                    border: 2px solid #e74c3c;
                    border-radius: 10px;
                    padding: 20px;
                    margin: 30px 0;
                    text-align: center;
                }
                .amount-label {
                    font-size: 18px;
                    color: #e74c3c;
                    font-weight: bold;
                    margin-bottom: 10px;
                }
                .amount-value {
                    font-size: 32px;
                    color: #e74c3c;
                    font-weight: bold;
                }
                .amount-words {
                    font-size: 16px;
                    color: #2c3e50;
                    margin-top: 10px;
                    font-style: italic;
                }
                .description-section {
                    background: #f0f8ff;
                    border: 1px solid #3498db;
                    border-radius: 8px;
                    padding: 15px;
                    margin: 20px 0;
                }
                .description-title {
                    font-weight: bold;
                    color: #2c3e50;
                    margin-bottom: 10px;
                }
                .footer {
                    border-top: 2px solid #333;
                    padding-top: 20px;
                    margin-top: 40px;
                }
                .signatures {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 50px;
                }
                .signature-box {
                    text-align: center;
                    width: 200px;
                }
                .signature-line {
                    border-bottom: 2px solid #333;
                    height: 50px;
                    margin-bottom: 10px;
                }
                .signature-label {
                    font-weight: bold;
                    color: #2c3e50;
                }
                .print-info {
                    text-align: center;
                    color: #7f8c8d;
                    font-size: 12px;
                    margin-top: 30px;
                    border-top: 1px solid #ddd;
                    padding-top: 15px;
                }
                @media print {
                    body {
                        margin: 0;
                        padding: 10px;
                    }
                    .receipt-container {
                        border: 2px solid #000;
                        box-shadow: none;
                    }
                    .print-info {
                        display: none;
                    }
                }
            </style>
        </head>
        <body>
            <div class="receipt-container">
                <!-- Header -->
                <div class="header">
                    <div class="company-name">شركة المقاولات المتقدمة</div>
                    <div class="receipt-title">إيصال مصروف</div>
                    <div class="receipt-number">رقم الإيصال: ${entry.registrationNumber}</div>
                </div>

                <!-- Receipt Body -->
                <div class="receipt-body">
                    <div class="info-row">
                        <span class="info-label">فئة المصروف:</span>
                        <span class="info-value">${entry.category}</span>
                    </div>

                    <div class="info-row">
                        <span class="info-label">تاريخ المصروف:</span>
                        <span class="info-value">${this.formatDate(entry.date)}</span>
                    </div>

                    <div class="info-row">
                        <span class="info-label">المورد/الجهة:</span>
                        <span class="info-value">${entry.vendor || 'غير محدد'}</span>
                    </div>

                    <div class="info-row">
                        <span class="info-label">رقم الإيصال:</span>
                        <span class="info-value">${entry.receiptNumber || 'غير محدد'}</span>
                    </div>

                    <div class="info-row">
                        <span class="info-label">طريقة الدفع:</span>
                        <span class="info-value">${paymentMethodArabic}</span>
                    </div>

                    <div class="info-row">
                        <span class="info-label">نوع العملة:</span>
                        <span class="info-value">${entry.currency === 'USD' ? 'دولار أمريكي (USD)' : 'دينار عراقي (IQD)'}</span>
                    </div>

                    <!-- Amount Section -->
                    <div class="amount-section">
                        <div class="amount-label">المبلغ المدفوع</div>
                        <div class="amount-value">${this.formatCurrency(entry.amount, entry.currency)}</div>
                        <div class="amount-words">${this.numberToWords(entry.amount, entry.currency)}</div>
                    </div>

                    <!-- Description Section -->
                    <div class="description-section">
                        <div class="description-title">وصف المصروف:</div>
                        <div>${entry.description}</div>
                    </div>

                    ${entry.notes ? `
                    <div class="info-row">
                        <span class="info-label">ملاحظات إضافية:</span>
                        <span class="info-value">${entry.notes}</span>
                    </div>
                    ` : ''}
                </div>

                <!-- Footer -->
                <div class="footer">
                    <div class="info-row">
                        <span class="info-label">تاريخ الطباعة:</span>
                        <span class="info-value">${currentDate} - ${currentTime}</span>
                    </div>

                    <div class="signatures">
                        <div class="signature-box">
                            <div class="signature-line"></div>
                            <div class="signature-label">توقيع المحاسب</div>
                        </div>

                        <div class="signature-box">
                            <div class="signature-line"></div>
                            <div class="signature-label">توقيع المدير المالي</div>
                        </div>

                        <div class="signature-box">
                            <div class="signature-line"></div>
                            <div class="signature-label">توقيع المدير العام</div>
                        </div>
                    </div>
                </div>

                <div class="print-info">
                    تم إنشاء هذا الإيصال بواسطة نظام المحاسبة الإلكتروني<br>
                    للاستفسارات يرجى الاتصال بقسم المحاسبة
                </div>
            </div>
        </body>
        </html>
        `;
    }

    // Convert number to words (simplified Arabic)
    numberToWords(amount, currency) {
        const num = parseFloat(amount);
        if (isNaN(num)) return '';

        const currencyName = currency === 'USD' ? 'دولار أمريكي' : 'دينار عراقي';

        if (num < 1000) {
            return `${num} ${currencyName}`;
        } else if (num < 1000000) {
            const thousands = Math.floor(num / 1000);
            const remainder = num % 1000;
            return `${thousands} ألف${remainder > 0 ? ' و ' + remainder : ''} ${currencyName}`;
        } else {
            const millions = Math.floor(num / 1000000);
            const remainder = num % 1000000;
            return `${millions} مليون${remainder > 0 ? ' و ' + Math.floor(remainder / 1000) + ' ألف' : ''} ${currencyName}`;
        }
    }

    // Refresh current view
    refreshCurrentView() {
        this.showView(this.currentView);
    }

    // Initialize default accounting guide
    initializeDefaultAccountingGuide() {
        console.log('Initializing default accounting guide...');

        const existingGuide = StorageManager.getData(StorageManager.STORAGE_KEYS.ACCOUNTING_GUIDE);
        console.log('Existing guide:', existingGuide);

        if (!existingGuide || existingGuide.length === 0) {
            console.log('Creating default accounting guide...');
            const defaultGuide = this.getDefaultAccountingGuide();
            const saved = StorageManager.saveData(StorageManager.STORAGE_KEYS.ACCOUNTING_GUIDE, defaultGuide);
            console.log('Default guide saved:', saved);

            if (saved) {
                console.log('Default accounting guide initialized successfully');
            } else {
                console.error('Failed to save default accounting guide');
            }
        } else {
            console.log('Accounting guide already exists with', existingGuide.length, 'items');
        }
    }

    // Get default accounting guide
    getDefaultAccountingGuide() {
        return [
            // مواد البناء
            { id: 'guide001', code: '5101', name: 'الأسمنت', category: 'مواد البناء', type: 'مصروف مباشر', description: 'أسمنت بورتلاندي عادي وخاص', notes: '', createdAt: new Date().toISOString() },
            { id: 'guide002', code: '5102', name: 'الحديد والصلب', category: 'مواد البناء', type: 'مصروف مباشر', description: 'حديد التسليح وقضبان الصلب', notes: '', createdAt: new Date().toISOString() },
            { id: 'guide003', code: '5103', name: 'الرمل والحصى', category: 'مواد البناء', type: 'مصروف مباشر', description: 'رمل البناء والحصى المختلف', notes: '', createdAt: new Date().toISOString() },
            { id: 'guide004', code: '5104', name: 'الطوب والبلوك', category: 'مواد البناء', type: 'مصروف مباشر', description: 'طوب أحمر وبلوك خرساني', notes: '', createdAt: new Date().toISOString() },
            { id: 'guide005', code: '5105', name: 'البلاط والسيراميك', category: 'مواد البناء', type: 'مصروف مباشر', description: 'بلاط أرضيات وسيراميك جدران', notes: '', createdAt: new Date().toISOString() },

            // العمالة
            { id: 'guide006', code: '5201', name: 'أجور العمال المهرة', category: 'العمالة', type: 'مصروف مباشر', description: 'أجور البنائين والحرفيين المهرة', notes: '', createdAt: new Date().toISOString() },
            { id: 'guide007', code: '5202', name: 'أجور العمال العاديين', category: 'العمالة', type: 'مصروف مباشر', description: 'أجور العمال غير المهرة', notes: '', createdAt: new Date().toISOString() },
            { id: 'guide008', code: '5203', name: 'أجور المقاولين الفرعيين', category: 'العمالة', type: 'مصروف مباشر', description: 'مدفوعات للمقاولين الفرعيين', notes: '', createdAt: new Date().toISOString() },

            // المعدات والآلات
            { id: 'guide009', code: '5301', name: 'إيجار المعدات الثقيلة', category: 'المعدات والآلات', type: 'مصروف مباشر', description: 'إيجار الحفارات والرافعات', notes: '', createdAt: new Date().toISOString() },
            { id: 'guide010', code: '5302', name: 'صيانة المعدات', category: 'المعدات والآلات', type: 'مصروف تشغيلي', description: 'صيانة وإصلاح المعدات', notes: '', createdAt: new Date().toISOString() },
            { id: 'guide011', code: '5303', name: 'قطع غيار المعدات', category: 'المعدات والآلات', type: 'مصروف تشغيلي', description: 'قطع غيار للمعدات والآلات', notes: '', createdAt: new Date().toISOString() },

            // النقل والمواصلات
            { id: 'guide012', code: '5401', name: 'نقل المواد', category: 'النقل والمواصلات', type: 'مصروف مباشر', description: 'نقل مواد البناء للموقع', notes: '', createdAt: new Date().toISOString() },
            { id: 'guide013', code: '5402', name: 'مصاريف الشاحنات', category: 'النقل والمواصلات', type: 'مصروف تشغيلي', description: 'وقود وصيانة الشاحنات', notes: '', createdAt: new Date().toISOString() },

            // الوقود والطاقة
            { id: 'guide014', code: '5501', name: 'وقود المعدات', category: 'الوقود والطاقة', type: 'مصروف تشغيلي', description: 'ديزل وبنزين للمعدات', notes: '', createdAt: new Date().toISOString() },
            { id: 'guide015', code: '5502', name: 'الكهرباء', category: 'الوقود والطاقة', type: 'مصروف تشغيلي', description: 'فواتير الكهرباء للموقع', notes: '', createdAt: new Date().toISOString() },

            // الرواتب والأجور
            { id: 'guide016', code: '5601', name: 'رواتب الموظفين', category: 'الرواتب والأجور', type: 'مصروف إداري', description: 'رواتب الموظفين الإداريين', notes: '', createdAt: new Date().toISOString() },
            { id: 'guide017', code: '5602', name: 'مكافآت ومزايا', category: 'الرواتب والأجور', type: 'مصروف إداري', description: 'مكافآت ومزايا الموظفين', notes: '', createdAt: new Date().toISOString() },

            // المكتب والإدارة
            { id: 'guide018', code: '5701', name: 'القرطاسية والمكتبيات', category: 'المكتب والإدارة', type: 'مصروف إداري', description: 'أوراق وأقلام ومستلزمات مكتبية', notes: '', createdAt: new Date().toISOString() },
            { id: 'guide019', code: '5702', name: 'الاتصالات', category: 'المكتب والإدارة', type: 'مصروف إداري', description: 'هاتف وإنترنت وفاكس', notes: '', createdAt: new Date().toISOString() },

            // التأمين
            { id: 'guide020', code: '5801', name: 'تأمين المشروع', category: 'التأمين', type: 'مصروف غير مباشر', description: 'تأمين ضد المخاطر والحوادث', notes: '', createdAt: new Date().toISOString() }
        ];
    }

    // Setup add guide form
    setupAddGuideForm() {
        const form = document.getElementById('addGuideForm');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveGuideItem();
        });
    }

    // Save guide item
    saveGuideItem() {
        const guideData = {
            code: document.getElementById('guideCode').value.trim(),
            name: document.getElementById('guideName').value.trim(),
            category: document.getElementById('guideCategory').value,
            type: document.getElementById('guideType').value,
            description: document.getElementById('guideDescription').value.trim(),
            notes: document.getElementById('guideNotes').value.trim()
        };

        // Validate required fields
        if (!guideData.code || !guideData.name || !guideData.category || !guideData.type) {
            this.showNotification('جميع الحقول المطلوبة يجب ملؤها', 'error');
            return;
        }

        // Check if code already exists
        const existingGuide = StorageManager.getData(StorageManager.STORAGE_KEYS.ACCOUNTING_GUIDE) || [];
        if (existingGuide.some(item => item.code === guideData.code && item.id !== this.editingGuideId)) {
            this.showNotification('رمز الحساب موجود بالفعل', 'error');
            return;
        }

        if (this.editingGuideId) {
            // Update existing item
            const updatedGuide = existingGuide.map(item =>
                item.id === this.editingGuideId
                    ? { ...item, ...guideData, updatedAt: new Date().toISOString() }
                    : item
            );

            if (StorageManager.saveData(StorageManager.STORAGE_KEYS.ACCOUNTING_GUIDE, updatedGuide)) {
                this.showNotification('تم تحديث العنصر بنجاح', 'success');
                this.editingGuideId = null;
            } else {
                this.showNotification('حدث خطأ أثناء التحديث', 'error');
            }
        } else {
            // Add new item
            const newItem = {
                id: StorageManager.generateId(),
                ...guideData,
                createdAt: new Date().toISOString()
            };

            existingGuide.push(newItem);

            if (StorageManager.saveData(StorageManager.STORAGE_KEYS.ACCOUNTING_GUIDE, existingGuide)) {
                this.showNotification('تم إضافة العنصر بنجاح', 'success');
            } else {
                this.showNotification('حدث خطأ أثناء الإضافة', 'error');
            }
        }

        // Reset form and refresh view
        document.getElementById('addGuideForm').reset();
        this.showGuideSubView('overview');
    }

    // Edit guide item
    editGuideItem(id) {
        const accountingGuide = StorageManager.getData(StorageManager.STORAGE_KEYS.ACCOUNTING_GUIDE) || [];
        const item = accountingGuide.find(g => g.id === id);

        if (!item) {
            this.showNotification('العنصر غير موجود', 'error');
            return;
        }

        // Switch to add form for editing
        this.showGuideSubView('add');

        // Fill form with item data
        setTimeout(() => {
            document.getElementById('guideCode').value = item.code;
            document.getElementById('guideName').value = item.name;
            document.getElementById('guideCategory').value = item.category;
            document.getElementById('guideType').value = item.type;
            document.getElementById('guideDescription').value = item.description || '';
            document.getElementById('guideNotes').value = item.notes || '';

            this.editingGuideId = id;
            this.showNotification('جاري تعديل العنصر', 'info');
        }, 100);
    }

    // Delete guide item
    deleteGuideItem(id) {
        if (confirm('هل أنت متأكد من حذف هذا العنصر من الدليل المحاسبي؟')) {
            const accountingGuide = StorageManager.getData(StorageManager.STORAGE_KEYS.ACCOUNTING_GUIDE) || [];
            const updatedGuide = accountingGuide.filter(item => item.id !== id);

            if (StorageManager.saveData(StorageManager.STORAGE_KEYS.ACCOUNTING_GUIDE, updatedGuide)) {
                this.showNotification('تم حذف العنصر بنجاح', 'success');
                this.showGuideSubView('overview');
            } else {
                this.showNotification('حدث خطأ أثناء الحذف', 'error');
            }
        }
    }

    // Print accounting guide
    printAccountingGuide() {
        const accountingGuide = StorageManager.getData(StorageManager.STORAGE_KEYS.ACCOUNTING_GUIDE) || [];

        if (accountingGuide.length === 0) {
            this.showNotification('لا يوجد دليل محاسبي للطباعة', 'error');
            return;
        }

        const groupedGuide = this.groupAccountingGuideByCategory(accountingGuide);
        const printHTML = this.generateAccountingGuidePrintHTML(groupedGuide);

        // Create print window
        const printWindow = window.open('', '_blank', 'width=1200,height=800');
        printWindow.document.write(printHTML);
        printWindow.document.close();

        // Wait for content to load then print
        printWindow.onload = function() {
            printWindow.print();
        };
    }

    // Generate accounting guide print HTML
    generateAccountingGuidePrintHTML(groupedGuide) {
        const currentDate = new Date().toLocaleDateString('ar-IQ');
        const currentTime = new Date().toLocaleTimeString('ar-IQ');

        let contentHTML = '';
        Object.keys(groupedGuide).forEach(category => {
            contentHTML += `
                <div class="category-section">
                    <h3 class="category-title">${category}</h3>
                    <table class="guide-table">
                        <thead>
                            <tr>
                                <th>رمز الحساب</th>
                                <th>اسم الحساب</th>
                                <th>نوع الحساب</th>
                                <th>الوصف</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${groupedGuide[category].map(item => `
                                <tr>
                                    <td><strong>${item.code}</strong></td>
                                    <td>${item.name}</td>
                                    <td>${item.type}</td>
                                    <td>${item.description || '-'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        });

        return `
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>الدليل المحاسبي للمصروفات</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    margin: 0;
                    padding: 20px;
                    background: white;
                    color: #333;
                    direction: rtl;
                    line-height: 1.6;
                }
                .header {
                    text-align: center;
                    border-bottom: 3px double #333;
                    padding-bottom: 20px;
                    margin-bottom: 30px;
                }
                .company-name {
                    font-size: 28px;
                    font-weight: bold;
                    color: #2c3e50;
                    margin-bottom: 10px;
                }
                .guide-title {
                    font-size: 24px;
                    color: #e74c3c;
                    font-weight: bold;
                    margin-bottom: 10px;
                }
                .print-date {
                    font-size: 14px;
                    color: #7f8c8d;
                }
                .category-section {
                    margin-bottom: 40px;
                    page-break-inside: avoid;
                }
                .category-title {
                    background: #34495e;
                    color: white;
                    padding: 15px;
                    margin-bottom: 20px;
                    border-radius: 5px;
                    font-size: 20px;
                    text-align: center;
                }
                .guide-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 20px;
                }
                .guide-table th,
                .guide-table td {
                    border: 1px solid #333;
                    padding: 12px 8px;
                    text-align: center;
                }
                .guide-table th {
                    background-color: #f8f9fa;
                    font-weight: bold;
                    font-size: 14px;
                }
                .guide-table td {
                    font-size: 13px;
                }
                .guide-table td:nth-child(4) {
                    text-align: right;
                    max-width: 300px;
                }
                @media print {
                    body {
                        margin: 0;
                        padding: 10px;
                    }
                    .category-section {
                        page-break-inside: avoid;
                    }
                    .guide-table {
                        page-break-inside: auto;
                    }
                    .guide-table tr {
                        page-break-inside: avoid;
                        page-break-after: auto;
                    }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="company-name">شركة المقاولات المتقدمة</div>
                <div class="guide-title">الدليل المحاسبي للمصروفات</div>
                <div class="print-date">تاريخ الطباعة: ${currentDate} - ${currentTime}</div>
            </div>

            ${contentHTML}

            <div style="margin-top: 50px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #ddd; padding-top: 20px;">
                تم إنشاء هذا الدليل بواسطة نظام المحاسبة الإلكتروني - شركة المقاولات المتقدمة
            </div>
        </body>
        </html>
        `;
    }

    // Create default guide manually
    createDefaultGuide() {
        console.log('Creating default guide manually...');

        const defaultGuide = this.getDefaultAccountingGuide();
        const saved = StorageManager.saveData(StorageManager.STORAGE_KEYS.ACCOUNTING_GUIDE, defaultGuide);

        if (saved) {
            console.log('Default guide created successfully');
            this.showNotification('تم إنشاء الدليل المحاسبي الافتراضي بنجاح', 'success');
            // Refresh the view
            this.showGuideSubView('overview');
        } else {
            console.error('Failed to create default guide');
            this.showNotification('فشل في إنشاء الدليل المحاسبي', 'error');
        }
    }

    // Get accounting guide options for dropdown
    getAccountingGuideOptions() {
        const guide = StorageManager.getData(StorageManager.STORAGE_KEYS.ACCOUNTING_GUIDE) || [];

        if (guide.length === 0) {
            return '<option value="">لا يوجد دليل محاسبي - قم بإنشائه أولاً</option>';
        }

        // Group by category
        const grouped = {};
        guide.forEach(item => {
            if (!grouped[item.category]) {
                grouped[item.category] = [];
            }
            grouped[item.category].push(item);
        });

        let options = '';
        Object.keys(grouped).forEach(category => {
            options += `<optgroup label="${category}">`;
            grouped[category].forEach(item => {
                options += `<option value="${item.id}" data-code="${item.code}" data-name="${item.name}">${item.code} - ${item.name}</option>`;
            });
            options += '</optgroup>';
        });

        return options;
    }

    // Calculate currency conversion (respects manual independence)
    calculateCurrency(changedCurrency = null) {
        const amountIQDInput = document.getElementById('expenseAmountIQD');
        const amountUSDInput = document.getElementById('expenseAmountUSD');
        const rateInput = document.getElementById('expenseExchangeRate');
        const autoToggle = document.getElementById('enableAutoConversion');

        const amountIQD = parseFloat(amountIQDInput?.value) || 0;
        const amountUSD = parseFloat(amountUSDInput?.value) || 0;
        const exchangeRate = parseFloat(rateInput?.value) || 1500;
        const auto = !!autoToggle?.checked; // convert only when enabled

        if (!auto) {
            // User wants independent amounts; do nothing.
            return;
        }

        if (changedCurrency === 'IQD' && amountIQD > 0) {
            // Convert IQD to USD only if USD field is empty
            if (!amountUSDInput.value) {
                const usdAmount = amountIQD / exchangeRate;
                amountUSDInput.value = isFinite(usdAmount) ? usdAmount.toFixed(2) : '';
            }
        } else if (changedCurrency === 'USD' && amountUSD > 0) {
            // Convert USD to IQD only if IQD field is empty
            if (!amountIQDInput.value) {
                const iqdAmount = amountUSD * exchangeRate;
                amountIQDInput.value = isFinite(iqdAmount) ? Math.round(iqdAmount) : '';
            }
        } else if (!changedCurrency) {
            // Exchange rate changed: update the other field only if it's empty
            if (amountUSD > 0 && !amountIQDInput.value) {
                const iqdAmount = amountUSD * exchangeRate;
                amountIQDInput.value = isFinite(iqdAmount) ? Math.round(iqdAmount) : '';
            } else if (amountIQD > 0 && !amountUSDInput.value) {
                const usdAmount = amountIQD / exchangeRate;
                amountUSDInput.value = isFinite(usdAmount) ? usdAmount.toFixed(2) : '';
            }
        }
    }

    // Preview expense before saving
    previewExpense() {
        const formData = this.getExpenseFormData();
        if (!formData) return;

        const previewDiv = document.getElementById('expensePreview');
        if (!previewDiv) {
            // Create preview div if it doesn't exist
            const previewHTML = `
                <div id="expensePreview" class="neumorphic-card mt-4">
                    <div class="card-header">
                        <h5><i class="bi bi-eye me-2"></i>معاينة المصروف</h5>
                    </div>
                    <div class="card-body" id="expensePreviewContent">
                        <!-- Preview content will be loaded here -->
                    </div>
                </div>
            `;
            document.querySelector('.neumorphic-card').insertAdjacentHTML('afterend', previewHTML);
        }

        const previewContent = `
            <div class="row">
                <div class="col-md-6">
                    <table class="table table-borderless">
                        <tr><td><strong>رقم القيد:</strong></td><td>${formData.registrationNumber}</td></tr>
                        <tr><td><strong>التاريخ:</strong></td><td>${this.formatDate(formData.date)}</td></tr>
                        <tr><td><strong>البيان:</strong></td><td>${formData.description}</td></tr>
                        <tr><td><strong>المستفيد:</strong></td><td>${formData.beneficiary || 'غير محدد'}</td></tr>
                        <tr><td><strong>المورد:</strong></td><td>${formData.vendor || 'غير محدد'}</td></tr>
                    </table>
                </div>
                <div class="col-md-6">
                    <table class="table table-borderless">
                        <tr><td><strong>المبلغ بالدينار:</strong></td><td>${this.formatCurrency(formData.amountIQD, 'IQD')}</td></tr>
                        <tr><td><strong>المبلغ بالدولار:</strong></td><td>${this.formatCurrency(formData.amountUSD, 'USD')}</td></tr>
                        <tr><td><strong>سعر الصرف:</strong></td><td>${formData.exchangeRate}</td></tr>
                        <tr><td><strong>رقم الوصل:</strong></td><td>${formData.receiptNumber || 'غير محدد'}</td></tr>
                        <tr><td><strong>طريقة الدفع:</strong></td><td>${this.getPaymentMethodText(formData.paymentMethod)}</td></tr>
                    </table>
                </div>
            </div>
            ${formData.notes ? `<div class="mt-3"><strong>الملاحظات:</strong><br>${formData.notes}</div>` : ''}
        `;

        document.getElementById('expensePreviewContent').innerHTML = previewContent;
        document.getElementById('expensePreview').style.display = 'block';

        // Scroll to preview
        document.getElementById('expensePreview').scrollIntoView({ behavior: 'smooth' });
    }

    // Get expense form data
    getExpenseFormData() {
        const registrationNumber = document.getElementById('expenseRegistrationNumber')?.value;
        const date = document.getElementById('expenseDate')?.value;
        const amountIQD = parseFloat(document.getElementById('expenseAmountIQD')?.value) || 0;
        const amountUSD = parseFloat(document.getElementById('expenseAmountUSD')?.value) || 0;
        const exchangeRate = parseFloat(document.getElementById('expenseExchangeRate')?.value) || 1500;
        const description = document.getElementById('expenseDescription')?.value;
        const accountingGuide = document.getElementById('expenseAccountingGuide')?.value;
        const beneficiary = document.getElementById('expenseBeneficiary')?.value;
        const receiptNumber = document.getElementById('expenseReceiptNumber')?.value;
        const receiptDate = document.getElementById('expenseReceiptDate')?.value;
        const vendor = document.getElementById('expenseVendor')?.value;
        const paymentMethod = document.getElementById('expensePaymentMethod')?.value;
        const category = document.getElementById('expenseCategory')?.value;
        const project = document.getElementById('expenseProject')?.value;
        const notes = document.getElementById('expenseNotes')?.value;

        // Validation
        if (!registrationNumber || !date || !description || !accountingGuide || !category) {
            this.showNotification('يرجى ملء جميع الحقول المطلوبة', 'error');
            return null;
        }

        if (amountIQD === 0 && amountUSD === 0) {
            this.showNotification('يرجى إدخال مبلغ المصروف', 'error');
            return null;
        }

        return {
            registrationNumber,
            date,
            amountIQD,
            amountUSD,
            exchangeRate,
            description,
            accountingGuide,
            beneficiary,
            receiptNumber,
            receiptDate,
            vendor,
            paymentMethod,
            category,
            project,
            notes
        };
    }

    // Get payment method text
    getPaymentMethodText(method) {
        const methods = {
            'cash': 'نقداً',
            'bank_transfer': 'تحويل بنكي',
            'check': 'شيك',
            'credit_card': 'بطاقة ائتمان',
            'electronic_payment': 'دفع إلكتروني'
        };
        return methods[method] || 'غير محدد';
    }

    // Show notification
    showNotification(message, type = 'info') {
        if (window.app && window.app.showNotification) {
            window.app.showNotification(message, type);
        } else {
            alert(message);
        }
    }

    // Fill test data function
    fillTestData() {
        // Keep current registration number and date
        const currentRegNumber = document.getElementById('expenseRegistrationNumber').value;
        const currentDate = document.getElementById('expenseDate').value;

        document.getElementById('expenseAmountIQD').value = '150000';
        document.getElementById('expenseAmountUSD').value = '100';
        document.getElementById('expenseDescription').value = 'شراء مواد بناء للمشروع';
        document.getElementById('expenseAccountingGuide').value = 'guide001';
        document.getElementById('expenseBeneficiary').value = 'شركة مواد البناء المحدودة';
        document.getElementById('expenseReceiptNumber').value = 'REC-2024-001';
        document.getElementById('expenseReceiptDate').value = currentDate;
        document.getElementById('expenseVendor').value = 'مؤسسة الإعمار للمواد';
        document.getElementById('expensePaymentMethod').value = 'cash';
        document.getElementById('expenseCategory').value = 'مواد البناء';
        document.getElementById('expenseProject').value = 'مشروع 1';
        document.getElementById('expenseNotes').value = 'مصروف ضروري للمشروع الرئيسي';

        // Restore registration number and date
        document.getElementById('expenseRegistrationNumber').value = currentRegNumber;
        document.getElementById('expenseDate').value = currentDate;

        this.showNotification('تم ملء النموذج ببيانات تجريبية', 'info');
    }



    // Print invoice function
    printInvoice() {
        const formData = this.getExpenseFormData();
        if (!formData) return;

        // Create new window for printing
        const printWindow = window.open('', '_blank', 'width=800,height=600');

        // Get accounting guide details
        const accountingSelect = document.getElementById('expenseAccountingGuide');
        const selectedOption = accountingSelect.options[accountingSelect.selectedIndex];
        const accountingCode = selectedOption.getAttribute('data-code') || '';
        const accountingName = selectedOption.getAttribute('data-name') || selectedOption.text;

        const printContent = `
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
            <meta charset="UTF-8">
            <title>فاتورة مصروف - ${formData.registrationNumber}</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    margin: 20px;
                    background: white;
                    color: #333;
                    line-height: 1.6;
                }
                .header {
                    text-align: center;
                    border-bottom: 3px solid #2c5aa0;
                    padding-bottom: 20px;
                    margin-bottom: 30px;
                }
                .header h1 {
                    color: #2c5aa0;
                    margin: 0;
                    font-size: 28px;
                }
                .header h2 {
                    color: #666;
                    margin: 10px 0;
                    font-size: 18px;
                }
                .info-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 20px 0;
                    border: 2px solid #2c5aa0;
                }
                .info-table th, .info-table td {
                    border: 1px solid #ddd;
                    padding: 12px;
                    text-align: right;
                }
                .info-table th {
                    background-color: #f8f9fa;
                    font-weight: bold;
                    color: #2c5aa0;
                    width: 25%;
                }
                .amount-cell {
                    font-weight: bold;
                    font-size: 16px;
                }
                .amount-iqd {
                    color: #d63384;
                }
                .amount-usd {
                    color: #198754;
                }
                .signatures {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 60px;
                }
                .signature-box {
                    text-align: center;
                    width: 30%;
                }
                .signature-line {
                    border-top: 2px solid #333;
                    padding-top: 10px;
                    margin-top: 40px;
                    font-weight: bold;
                }
                .footer {
                    margin-top: 40px;
                    text-align: center;
                    font-size: 12px;
                    color: #666;
                    border-top: 1px solid #ddd;
                    padding-top: 20px;
                }
                @media print {
                    body { margin: 0; }
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>فاتورة مصروف</h1>
                <h2>نظام إدارة المصروفات</h2>
                <p>تاريخ الطباعة: ${new Date().toLocaleDateString('ar-EG')}</p>
            </div>

            <table class="info-table">
                <tr>
                    <th>رقم القيد</th>
                    <td style="font-weight: bold; color: #2c5aa0; font-size: 16px;">${formData.registrationNumber}</td>
                    <th>التاريخ</th>
                    <td>${new Date(formData.date).toLocaleDateString('ar-EG')}</td>
                </tr>
                <tr>
                    <th>البيان</th>
                    <td colspan="3" style="font-weight: bold; font-size: 16px;">${formData.description}</td>
                </tr>
                <tr>
                    <th>المبلغ بالدينار</th>
                    <td class="amount-cell amount-iqd">${formData.amountIQD.toLocaleString()} د.ع</td>
                    <th>المبلغ بالدولار</th>
                    <td class="amount-cell amount-usd">$${formData.amountUSD.toFixed(2)}</td>
                </tr>
                <tr>
                    <th>سعر الصرف</th>
                    <td>${formData.exchangeRate}</td>
                    <th>طريقة الدفع</th>
                    <td>${this.getPaymentMethodText(formData.paymentMethod)}</td>
                </tr>
                <tr>
                    <th>الدليل المحاسبي</th>
                    <td colspan="3">${accountingCode} - ${accountingName}</td>
                </tr>
                <tr>
                    <th>المستفيد</th>
                    <td>${formData.beneficiary || 'غير محدد'}</td>
                    <th>المورد/الجهة</th>
                    <td>${formData.vendor || 'غير محدد'}</td>
                </tr>
                <tr>
                    <th>رقم الوصل</th>
                    <td>${formData.receiptNumber || 'غير محدد'}</td>
                    <th>تاريخ الوصل</th>
                    <td>${formData.receiptDate ? new Date(formData.receiptDate).toLocaleDateString('ar-EG') : 'غير محدد'}</td>
                </tr>
                <tr>
                    <th>فئة المصروف</th>
                    <td>${formData.category}</td>
                    <th>المشروع</th>
                    <td>${formData.project || 'غير محدد'}</td>
                </tr>
                ${formData.notes ? `
                <tr>
                    <th>الملاحظات</th>
                    <td colspan="3">${formData.notes}</td>
                </tr>
                ` : ''}
            </table>

            <div class="signatures">
                <div class="signature-box">
                    <div class="signature-line">المحاسب</div>
                </div>
                <div class="signature-box">
                    <div class="signature-line">المدير المالي</div>
                </div>
                <div class="signature-box">
                    <div class="signature-line">المدير العام</div>
                </div>
            </div>

            <div class="footer">
                <p>تم إنشاء هذه الفاتورة بواسطة نظام إدارة المصروفات</p>
                <p>${new Date().toLocaleString('ar-EG')}</p>
            </div>

            <div class="no-print" style="text-align: center; margin-top: 30px;">
                <button onclick="window.print()" style="background: #2c5aa0; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin: 5px;">طباعة</button>
                <button onclick="window.close()" style="background: #6c757d; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin: 5px;">إغلاق</button>
            </div>
        </body>
        </html>
        `;

        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
    }
}

// Initialize expenses manager
let expensesManager;
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing ExpensesManager...');
    expensesManager = new ExpensesManager();
    console.log('ExpensesManager initialized:', expensesManager);

    // Test function for debugging
    window.testAccountingGuide = function() {
        console.log('Testing accounting guide...');
        if (expensesManager) {
            expensesManager.loadAccountingGuideView();
        } else {
            console.error('ExpensesManager not initialized');
        }
    };

    // Debug function to check if everything is working
    window.debugExpenses = function() {
        console.log('=== Debug Expenses ===');
        console.log('ExpensesManager:', expensesManager);
        console.log('StorageManager:', typeof StorageManager);
        console.log('Storage Keys:', StorageManager.STORAGE_KEYS);

        // Try to get accounting guide data
        const guide = StorageManager.getData(StorageManager.STORAGE_KEYS.ACCOUNTING_GUIDE);
        console.log('Accounting Guide Data:', guide);

        // Try to initialize default guide
        if (expensesManager) {
            console.log('Calling initializeDefaultAccountingGuide...');
            expensesManager.initializeDefaultAccountingGuide();

            // Check again
            const guideAfter = StorageManager.getData(StorageManager.STORAGE_KEYS.ACCOUNTING_GUIDE);
            console.log('Accounting Guide After Init:', guideAfter);
        }
    };
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ExpensesManager;
}
