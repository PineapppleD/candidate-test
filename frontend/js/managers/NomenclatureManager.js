import TableManager from "./TableManager.js";
import ApiClient from "../api/ApiCilent.js";
import { TABLE_CONFIG } from "../config/tableConfig.js";
import ModalManager from "./ModalManager.js";

// Класс для управления номенклатурой
export default class NomenclatureManager {
    constructor() {
        this.container = null;
        this.tableManager = null;
    }

    debounce(func, delay = 300) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    }

    async init(containerId, modalManager) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

        this.tableManager = new TableManager(this.container, TABLE_CONFIG, modalManager);
        await this.loadData();
    }

    async loadData(showDeleted = false) {
        if (!this.container) return;

        this.container.innerHTML = '<p>Загрузка номенклатуры...</p>';

        try {
            const result = await ApiClient.getNomenclature(showDeleted);

            if (result.status !== 200) throw new Error(result.message || 'Ошибка запроса');

            if (!result.data || !result.data.length) {
                this.container.innerHTML = '<p>Нет данных</p>';
                return;
            }

            this.tableManager.render(result.data, showDeleted);

        } catch (error) {
            this.container.innerHTML = `<p style='color:red'>Ошибка: ${error.message}</p>`;
        }
    }

}