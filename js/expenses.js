// Expenses Management System
class ExpensesManager {
    constructor() {
        this.currentView = 'overview';
        this.editingId = null;
        this.init();
    }

    init() {
        this.loadExpensesSection();
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
        }
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
                                ${this.renderRecentExpenses(data.expenses || [])}
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
                        <div class="col-md-6 mb-3">
                            <label for="expenseRegistrationNumber" class="form-label">رقم التسجيل</label>
                            <input type="text" class="form-control neumorphic-input" id="expenseRegistrationNumber" 
                                   value="${StorageManager.generateRegistrationNumber()}" readonly>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="expenseCategory" class="form-label">فئة المصروف</label>
                            <select class="form-control neumorphic-input" id="expenseCategory" required>
                                <option value="">اختر الفئة</option>
                                ${categories.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
                            </select>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="expenseCurrency" class="form-label">نوع العملة</label>
                            <select class="form-control neumorphic-input" id="expenseCurrency" required>
                                <option value="">اختر العملة</option>
                                <option value="USD">دولار أمريكي (USD)</option>
                                <option value="IQD">دينار عراقي (IQD)</option>
                            </select>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="expenseAmount" class="form-label">المبلغ</label>
                            <input type="number" class="form-control neumorphic-input" id="expenseAmount" 
                                   step="0.01" min="0" required>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="expenseDate" class="form-label">تاريخ المصروف</label>
                            <input type="date" class="form-control neumorphic-input" id="expenseDate" 
                                   value="${new Date().toISOString().split('T')[0]}" required>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="expenseReceiptNumber" class="form-label">رقم الإيصال</label>
                            <input type="text" class="form-control neumorphic-input" id="expenseReceiptNumber">
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="expenseVendor" class="form-label">المورد/الجهة</label>
                            <input type="text" class="form-control neumorphic-input" id="expenseVendor">
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="expensePaymentMethod" class="form-label">طريقة الدفع</label>
                            <select class="form-control neumorphic-input" id="expensePaymentMethod">
                                <option value="">اختر طريقة الدفع</option>
                                <option value="cash">نقداً</option>
                                <option value="bank_transfer">تحويل بنكي</option>
                                <option value="check">شيك</option>
                                <option value="credit_card">بطاقة ائتمان</option>
                            </select>
                        </div>
                        <div class="col-12 mb-3">
                            <label for="expenseDescription" class="form-label">وصف المصروف</label>
                            <textarea class="form-control neumorphic-input" id="expenseDescription" rows="3" required></textarea>
                        </div>
                        <div class="col-12 mb-3">
                            <label for="expenseNotes" class="form-label">ملاحظات إضافية</label>
                            <textarea class="form-control neumorphic-input" id="expenseNotes" rows="2"></textarea>
                        </div>
                        <div class="col-12">
                            <button type="submit" class="btn btn-primary neumorphic-btn">
                                <i class="bi bi-save me-2"></i>حفظ المصروف
                            </button>
                            <button type="reset" class="btn btn-secondary neumorphic-btn ms-2">
                                <i class="bi bi-arrow-clockwise me-2"></i>إعادة تعيين
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Recent Expenses List -->
            <div class="neumorphic-card mt-4">
                <div class="card-header">
                    <h4><i class="bi bi-list me-2"></i>المصروفات الحديثة</h4>
                </div>
                <div class="card-body">
                    <div id="expensesList">
                        ${this.renderExpensesList()}
                    </div>
                </div>
            </div>
        `;

        document.getElementById('expensesContent').innerHTML = addExpenseHTML;
        this.setupExpenseForm();
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
}

// Initialize expenses manager
let expensesManager;
document.addEventListener('DOMContentLoaded', () => {
    expensesManager = new ExpensesManager();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ExpensesManager;
}
