import TableManager from "./TableManager.js";
import ApiClient from "../api/ApiCilent.js";
import { INDIVIDUALS_TABLE_CONFIG } from "../config/individualsTableConfig.js";

// Класс для управления физическими лицами
export default class IndividualsManager {
    constructor() {
        this.container = null;
        this.tableManager = null;
        this.name = 'individuals';
    }

    async init(containerId, modalManager) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

        this.tableManager = new TableManager(this.container, INDIVIDUALS_TABLE_CONFIG, modalManager, 'individuals');
        await this.loadData();
    }

    async loadData(showDeleted = false) {
        if (!this.container) return;

        this.container.innerHTML = '<p>Загрузка физических лиц...</p>';

        try {
            const result = await ApiClient.getIndividuals();

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