import TableManager from "./TableManager.js";
import ApiClient from "../api/ApiCilent.js";
import { STAFFERS_TABLE_CONFIG } from "../config/staffersTableConfig.js";
import ModalManager from "./ModalManager.js";

// Класс для управления сотрудниками
export default class StaffersManager {
    constructor() {
        this.container = null;
        this.tableManager = null;
        this.name = 'staffers';
    }

    async init(containerId, modalManager) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

        this.tableManager = new TableManager(this.container, STAFFERS_TABLE_CONFIG, modalManager, 'staffers');
        await this.loadData();
    }

    async loadData(showDeleted = false) {
        if (!this.container) return;

        this.container.innerHTML = '<p>Загрузка сотрудников...</p>';

        try {
            const result = await ApiClient.getStaffers();

            if (result.status !== 200) throw new Error(result.message || 'Ошибка запроса');

            if (!result.data || !result.data.length) {
                this.container.innerHTML = '<p>Нет данных</p>';
                return;
            }
            console.log(result.data);
            this.tableManager.render(result.data, showDeleted);

        } catch (error) {
            this.container.innerHTML = `<p style='color:red'>Ошибка: ${error.message}</p>`;
        }
    }
}