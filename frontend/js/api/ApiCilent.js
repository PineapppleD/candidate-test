// Класс для работы с API
export default class ApiClient {
    static async request(endpoint, data) {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await response.json();
    }

    static async getNomenclature() {
        return await this.request('/api', { type: 'nomenclature' });
    }

    static async getIndividuals() {
        return await this.request('/api', { type: 'individuals' });
    }

    static async getStaffers() {
        return await this.request('/api', { type: 'staffers' });
    }

    static async getMetadata(table) {
        return await this.request('/api/metadata', { table });
    }

    static async selectInstance(table, uuid) {
        return await this.request('/api/instance/select', { table, uuid });
    }

    static async insertInstance(table, data) {
        return await this.request('/api/instance/insert', { table, data });
    }

    static async updateInstance(table, uuid, data) {
        return await this.request('/api/instance/update', { table, uuid, data });
    }

    static async deleteInstance(table, uuid) {
        return await this.request('/api/instance/delete', { table, uuid });
    }
}