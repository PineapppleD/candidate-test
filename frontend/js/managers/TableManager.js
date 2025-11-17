import { debounce } from "../utils/debounce.js";
import ApiClient from "../api/ApiCilent.js";

// Класс для управления таблицей
export default class TableManager {
    constructor(container, config, modalManager) {
        this.container = container;
        this.modalManager = modalManager;
        this.config = config;
        this.data = [];
    }

    render(data, showDeleted = false) {
        this.data = data.filter(item => !item.deleted);
        this.container.innerHTML = '';

        const toggle = this.createShowDeletedToggle(showDeleted);
        this.container.appendChild(toggle);

        const createButton = this.createButton();
        this.container.appendChild(createButton);

        const searchInput = this.createSearchInput();
        this.container.appendChild(searchInput);

        const table = this.createTable(this.data);
        this.container.appendChild(table);
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
            const { data: allData } = await ApiClient.getNomenclature(); // получаем все записи
            const data = checkbox.checked
                ? allData.filter(item => item.deleted)
                : allData.filter(item => !item.deleted); // только не удалённые

            const oldTable = this.container.querySelector('table');
            if (oldTable) oldTable.remove();

            const newTable = this.createTable(data);
            this.container.appendChild(newTable);
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

            const filteredData = this.data.filter(item =>
                (item.code && item.code.toLowerCase().includes(query)) ||
                (item.represent && item.represent.toLowerCase().includes(query))
            );

            const oldTable = this.container.querySelector('table');
            if (oldTable) oldTable.remove();

            const newTable = this.createTable(filteredData);
            this.container.appendChild(newTable);
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

    createTable(data) {
        const table = document.createElement('table');
        table.style.cssText = this.getStyleString(this.config.tableStyle);

        // Заголовки
        const headerRow = this.createHeaderRow();
        table.appendChild(headerRow);

        // Данные
        data.forEach(row => {
            const dataRow = this.createDataRow(row);
            table.appendChild(dataRow);
        });

        return table;
    }

    createHeaderRow() {
        const row = document.createElement('tr');
        Object.entries(this.config.headerStyle).forEach(([key, value]) => {
            row.style[key] = value;
        });

        Object.entries(this.config.columns).forEach(([fieldName, config]) => {
            if (!config.visible) return;

            const th = document.createElement('th');
            th.textContent = config.title;

            const cellStyles = { ...this.config.cellStyle };
            if (config.width) cellStyles.width = config.width;
            if (config.align) cellStyles.textAlign = config.align;

            th.style.cssText = this.getStyleString(cellStyles);
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

        // Hover эффект
        dataRow.addEventListener('mouseenter', () => {
            dataRow.style.backgroundColor = '#f0f8ff';
        });
        dataRow.addEventListener('mouseleave', () => {
            dataRow.style.backgroundColor = '';
        });

        // Клик по строке
        dataRow.addEventListener('click', () => {
            this.modalManager.openEditModal(row.uuid);
        });

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