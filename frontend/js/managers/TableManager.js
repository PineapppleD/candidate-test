import { debounce } from "../utils/debounce.js";
import ApiClient from "../api/ApiCilent.js";
export default class TableManager {
    constructor(container, config, modalManager) {
        this.container = container;
        this.modalManager = modalManager;
        this.config = config;
        this.data = [];
        this.currentPage = 1;
        this.limit = 10;           
        this.sortedColumn = null; 
        this.sortAsc = true;    
    }

    async render(data = [], showDeleted = false) {
        this.data = showDeleted ? data.filter(item => item.deleted) : data.filter(item => !item.deleted);
        this.showDeleted = showDeleted;
        this.currentPage = 1;

        this.container.innerHTML = '';

        const toggle = this.createShowDeletedToggle(this.showDeleted);
        this.container.appendChild(toggle);

        const createButton = this.createButton();
        this.container.appendChild(createButton);

        const searchInput = this.createSearchInput();
        this.container.appendChild(searchInput);

        this.renderPage();
    }

    createShowDeletedToggle(showDeleted) {
        const container = document.createElement('div');
        container.style.marginBottom = '10px';

        const label = document.createElement('label');
        label.textContent = 'Показать удаленные';
        label.style.marginRight = '10px';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = showDeleted;

        checkbox.addEventListener('change', async () => {
            const allData = (await ApiClient.getNomenclature()).data || [];
            this.showDeleted = checkbox.checked;
            this.data = this.showDeleted ? allData.filter(item => item.deleted) : allData.filter(item => !item.deleted);
            this.currentPage = 1;
            this.renderPage();
        });

        container.appendChild(label);
        container.appendChild(checkbox);
        return container;
    }

    createSearchInput() {
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'Поиск по коду или названию...';
        input.style.cssText = `
            width: 100%;
            padding: 10px;
            margin-bottom: 15px;
            border: 1px solid #ddd;
            border-radius: 4px;
            box-sizing: border-box;
        `;

        const debouncedFilter = debounce(() => {
            const query = input.value.toLowerCase();
            this.data = this.data.filter(item =>
                (item.code && item.code.toLowerCase().includes(query)) ||
                (item.represent && item.represent.toLowerCase().includes(query))
            );
            this.currentPage = 1;
            this.renderPage();
        }, 300);

        input.addEventListener('input', debouncedFilter);

        return input;
    }

    createButton() {
        const button = document.createElement('button');
        button.textContent = '+ Создать';
        button.style.cssText = `
            background: #28a745;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            margin-bottom: 15px;
            font-size: 14px;
            font-weight: bold;
        `;
        button.addEventListener('click', () => {
            this.modalManager.openCreateModal();
        });
        return button;
    }

    renderPage() {
        const start = (this.currentPage - 1) * this.limit;
        const end = start + this.limit;
        const pageData = this.data.slice(start, end);

        const oldTable = this.container.querySelector('table');
        if (oldTable) oldTable.remove();

        const table = this.createTable(pageData);
        this.container.appendChild(table);

        this.createPaginationControls();
    }

    createPaginationControls() {
        const existing = this.container.querySelector('.pagination');
        if (existing) existing.remove();

        const totalPages = Math.ceil(this.data.length / this.limit);
        if (totalPages <= 1) return;

        const pagination = document.createElement('div');
        pagination.className = 'pagination';
        pagination.style.cssText = 'margin-top: 15px; display: flex; gap: 5px;';

        for (let i = 1; i <= totalPages; i++) {
            const btn = document.createElement('button');
            btn.textContent = i;
            btn.style.cssText = `
                padding: 5px 10px;
                cursor: pointer;
                background: ${i === this.currentPage ? '#28a745' : '#f0f0f0'};
                color: ${i === this.currentPage ? 'white' : '#333'};
                border: 1px solid #ddd;
                border-radius: 4px;
            `;
            btn.addEventListener('click', () => {
                this.currentPage = i;
                this.renderPage();
            });
            pagination.appendChild(btn);
        }

        this.container.appendChild(pagination);
    }

    createTable(data) {
        const table = document.createElement('table');
        table.style.cssText = this.getStyleString(this.config.tableStyle);

        const headerRow = this.createHeaderRow();
        table.appendChild(headerRow);

        data.forEach(row => {
            const dataRow = this.createDataRow(row);
            table.appendChild(dataRow);
        });

        return table;
    }

    createHeaderRow() {
        const row = document.createElement('tr');
        Object.entries(this.config.headerStyle).forEach(([key, value]) => row.style[key] = value);

        Object.entries(this.config.columns).forEach(([fieldName, config]) => {
            if (!config.visible) return;

            const th = document.createElement('th');
            // Заголовок колонки
            const titleSpan = document.createElement('span');
            titleSpan.textContent = config.title;

            // Иконка сортировки
            const sortIcon = document.createElement('img');
            sortIcon.src = 'https://www.svgrepo.com/show/527495/sort-vertical.svg';
            sortIcon.alt = 'sort icon';
            sortIcon.style.width = '20px';
            sortIcon.style.height = '20px';

            // Добавляем в th
            th.appendChild(titleSpan);
            th.appendChild(sortIcon);

            const cellStyles = { ...this.config.cellStyle };
            if (config.width) cellStyles.width = config.width;
            if (config.align) cellStyles.textAlign = config.align;
            th.style.cssText = this.getStyleString(cellStyles);
            

            // Сортировка по клику на заголовок
            th.style.cursor = 'pointer';
            th.addEventListener('click', () => {
                if (this.sortedColumn === fieldName) this.sortAsc = !this.sortAsc;
                else this.sortAsc = true;
                this.sortedColumn = fieldName;

                this.data.sort((a, b) => {
                    if (a[fieldName] == null) return 1;
                    if (b[fieldName] == null) return -1;
                    if (a[fieldName] === b[fieldName]) return 0;
                    return (a[fieldName] > b[fieldName] ? 1 : -1) * (this.sortAsc ? 1 : -1);
                });

                this.renderPage();
            });

            row.appendChild(th);
        });

        return row;
    }

    createDataRow(row) {
        const dataRow = document.createElement('tr');
        dataRow.style.cssText = `
            cursor: pointer;
            transition: background-color 0.2s;
        `;
        dataRow.addEventListener('mouseenter', () => dataRow.style.backgroundColor = '#f0f8ff');
        dataRow.addEventListener('mouseleave', () => dataRow.style.backgroundColor = '');
        dataRow.addEventListener('click', () => this.modalManager.openEditModal(row.uuid));

        Object.entries(this.config.columns).forEach(([fieldName, config]) => {
            if (!config.visible) return;
            const td = document.createElement('td');
            td.textContent = row[fieldName] || '';
            const cellStyles = { ...this.config.cellStyle };
            if (config.width) cellStyles.width = config.width;
            if (config.align) cellStyles.textAlign = config.align;
            td.style.cssText = this.getStyleString(cellStyles);
            dataRow.appendChild(td);
        });

        return dataRow;
    }

    getStyleString(styleObj) {
        return Object.entries(styleObj)
            .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`)
            .join('; ');
    }
}
