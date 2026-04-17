// نظام البحث والتصفية المتقدم
class AdvancedSearch {
    constructor() {
        this.filters = {
            status: 'all',
            dateRange: 'all',
            searchQuery: '',
            sortBy: 'newest'
        };
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.setupSearchUI();
    }
    
    setupEventListeners() {
        // سيكون هذا في الصفحات التي تحتاج البحث
    }
    
    setupSearchUI() {
        // إنشاء واجهة البحث إذا لم تكن موجودة
        if (!document.getElementById('advancedSearch')) {
            this.createSearchUI();
        }
    }
    
    createSearchUI() {
        const searchHTML = `
            <div id="advancedSearch" class="advanced-search">
                <div class="search-header">
                    <div class="search-input-container">
                        <i class="fas fa-search"></i>
                        <input type="text" id="globalSearch" placeholder="ابحث في المتدربين، المقابلات، التقارير..." autocomplete="off">
                        <button class="clear-search" id="clearSearch" style="display: none;">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <button class="btn btn-primary" id="filterToggle">
                        <i class="fas fa-filter"></i> تصفية
                    </button>
                </div>
                
                <div class="filter-panel" id="filterPanel" style="display: none;">
                    <div class="filter-group">
                        <label>حالة المتدرب:</label>
                        <select id="statusFilter">
                            <option value="all">الكل</option>
                            <option value="pending">بانتظار الرد</option>
                            <option value="accepted">مقبول</option>
                            <option value="rejected">مرفوض</option>
                        </select>
                    </div>
                    
                    <div class="filter-group">
                        <label>الفترة الزمنية:</label>
                        <select id="dateFilter">
                            <option value="all">الكل</option>
                            <option value="today">اليوم</option>
                            <option value="week">هذا الأسبوع</option>
                            <option value="month">هذا الشهر</option>
                            <option value="custom">مخصص</option>
                        </select>
                    </div>
                    
                    <div class="filter-group" id="customDateRange" style="display: none;">
                        <label>من:</label>
                        <input type="date" id="dateFrom">
                        <label>إلى:</label>
                        <input type="date" id="dateTo">
                    </div>
                    
                    <div class="filter-group">
                        <label>ترتيب حسب:</label>
                        <select id="sortFilter">
                            <option value="newest">الأحدث أولاً</option>
                            <option value="oldest">الأقدم أولاً</option>
                            <option value="name">الاسم (أ-ي)</option>
                            <option value="urgency">الأكثر إلحاحاً</option>
                        </select>
                    </div>
                    
                    <div class="filter-actions">
                        <button class="btn btn-secondary" id="resetFilters">إعادة تعيين</button>
                        <button class="btn btn-primary" id="applyFilters">تطبيق التصفية</button>
                    </div>
                </div>
            </div>
        `;
        
        // إضافة CSS
        const styles = `
            .advanced-search {
                background: white;
                border-radius: 12px;
                padding: 20px;
                margin-bottom: 25px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            }
            
            .search-header {
                display: flex;
                gap: 15px;
                align-items: center;
            }
            
            .search-input-container {
                position: relative;
                flex: 1;
            }
            
            .search-input-container i {
                position: absolute;
                right: 15px;
                top: 50%;
                transform: translateY(-50%);
                color: #6c757d;
            }
            
            #globalSearch {
                width: 100%;
                padding: 12px 45px 12px 15px;
                border: 2px solid #e9ecef;
                border-radius: 8px;
                font-size: 1rem;
                transition: all 0.3s;
            }
            
            #globalSearch:focus {
                border-color: #1a2a6c;
                box-shadow: 0 0 0 3px rgba(26, 42, 108, 0.1);
            }
            
            .clear-search {
                position: absolute;
                left: 15px;
                top: 50%;
                transform: translateY(-50%);
                background: none;
                border: none;
                color: #6c757d;
                cursor: pointer;
                padding: 5px;
            }
            
            .filter-panel {
                margin-top: 20px;
                padding-top: 20px;
                border-top: 1px solid #e9ecef;
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 15px;
            }
            
            .filter-group {
                display: flex;
                flex-direction: column;
                gap: 5px;
            }
            
            .filter-group label {
                font-weight: 600;
                font-size: 0.9rem;
                color: #343a40;
            }
            
            .filter-group select,
            .filter-group input {
                padding: 8px 12px;
                border: 1px solid #e9ecef;
                border-radius: 6px;
                font-size: 0.9rem;
            }
            
            .filter-actions {
                display: flex;
                gap: 10px;
                align-items: flex-end;
            }
            
            .search-results {
                margin-top: 15px;
                font-size: 0.9rem;
                color: #6c757d;
            }
            
            @media (max-width: 768px) {
                .search-header {
                    flex-direction: column;
                }
                
                .filter-panel {
                    grid-template-columns: 1fr;
                }
                
                .filter-actions {
                    flex-direction: column;
                }
            }
        `;
        
        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
        
        // إضافة HTML للبحث
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.insertAdjacentHTML('afterbegin', searchHTML);
            this.setupSearchFunctionality();
        }
    }
    
    setupSearchFunctionality() {
        const searchInput = document.getElementById('globalSearch');
        const clearSearch = document.getElementById('clearSearch');
        const filterToggle = document.getElementById('filterToggle');
        const filterPanel = document.getElementById('filterPanel');
        const dateFilter = document.getElementById('dateFilter');
        const customDateRange = document.getElementById('customDateRange');
        const resetFilters = document.getElementById('resetFilters');
        const applyFilters = document.getElementById('applyFilters');
        
        // البحث أثناء الكتابة
        searchInput.addEventListener('input', (e) => {
            this.filters.searchQuery = e.target.value;
            clearSearch.style.display = e.target.value ? 'block' : 'none';
            this.performSearch();
        });
        
        // مسح البحث
        clearSearch.addEventListener('click', () => {
            searchInput.value = '';
            this.filters.searchQuery = '';
            clearSearch.style.display = 'none';
            this.performSearch();
        });
        
        // تبديل لوحة التصفية
        filterToggle.addEventListener('click', () => {
            const isVisible = filterPanel.style.display === 'block';
            filterPanel.style.display = isVisible ? 'none' : 'block';
            filterToggle.innerHTML = isVisible ? 
                '<i class="fas fa-filter"></i> تصفية' : 
                '<i class="fas fa-times"></i> إخفاء';
        });
        
        // إظهار/إخفاء نطاق التاريخ المخصص
        dateFilter.addEventListener('change', (e) => {
            customDateRange.style.display = e.target.value === 'custom' ? 'block' : 'none';
        });
        
        // إعادة تعيين الفلاتر
        resetFilters.addEventListener('click', () => {
            this.resetFilters();
        });
        
        // تطبيق الفلاتر
        applyFilters.addEventListener('click', () => {
            this.applyFilters();
        });
        
        // البحث بالضغط على Enter
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performSearch();
            }
        });
    }
    
    performSearch() {
        // هذا سيتغير حسب الصفحة
        const event = new CustomEvent('searchPerformed', { 
            detail: { filters: this.filters } 
        });
        document.dispatchEvent(event);
    }
    
    applyFilters() {
        this.filters.status = document.getElementById('statusFilter').value;
        this.filters.dateRange = document.getElementById('dateFilter').value;
        this.filters.sortBy = document.getElementById('sortFilter').value;
        
        if (this.filters.dateRange === 'custom') {
            this.filters.dateFrom = document.getElementById('dateFrom').value;
            this.filters.dateTo = document.getElementById('dateTo').value;
        }
        
        this.performSearch();
        
        // إغلاق لوحة التصفية
        document.getElementById('filterPanel').style.display = 'none';
        document.getElementById('filterToggle').innerHTML = '<i class="fas fa-filter"></i> تصفية';
    }
    
    resetFilters() {
        document.getElementById('statusFilter').value = 'all';
        document.getElementById('dateFilter').value = 'all';
        document.getElementById('sortFilter').value = 'newest';
        document.getElementById('customDateRange').style.display = 'none';
        
        this.filters = {
            status: 'all',
            dateRange: 'all',
            searchQuery: document.getElementById('globalSearch').value,
            sortBy: 'newest'
        };
        
        this.performSearch();
    }
    
    // دالة مساعدة للبحث في البيانات
    static searchData(data, query, fields) {
        if (!query.trim()) return data;
        
        const searchTerm = query.toLowerCase();
        return data.filter(item => {
            return fields.some(field => {
                const value = item[field];
                return value && value.toString().toLowerCase().includes(searchTerm);
            });
        });
    }
    
    // دالة مساعدة لتصفية البيانات حسب التاريخ
    static filterByDate(data, dateField, dateRange, customFrom, customTo) {
        if (dateRange === 'all') return data;
        
        const now = new Date();
        let fromDate, toDate;
        
        switch (dateRange) {
            case 'today':
                fromDate = new Date(now.setHours(0, 0, 0, 0));
                toDate = new Date(now.setHours(23, 59, 59, 999));
                break;
            case 'week':
                fromDate = new Date(now.setDate(now.getDate() - 7));
                toDate = new Date();
                break;
            case 'month':
                fromDate = new Date(now.setMonth(now.getMonth() - 1));
                toDate = new Date();
                break;
            case 'custom':
                if (customFrom && customTo) {
                    fromDate = new Date(customFrom);
                    toDate = new Date(customTo);
                }
                break;
        }
        
        return data.filter(item => {
            const itemDate = new Date(item[dateField]);
            return itemDate >= fromDate && itemDate <= toDate;
        });
    }
}

// تهيئة نظام البحث
document.addEventListener('DOMContentLoaded', () => {
    window.advancedSearch = new AdvancedSearch();
});