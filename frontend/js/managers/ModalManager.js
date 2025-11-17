import ApiClient from '../api/ApiCilent.js';
import { FIELDS_CONFIG } from '../config/filedsConfig.js';
import NomenclatureManager from './NomenclatureManager.js';

// Класс для управления модальными окнами
export default class ModalManager {
    constructor(manager = null) {
        this.currentManager = manager;
        this.currentData = null;
        this.createModalStructure();
    }

    createModalStructure() {
        // Фон модального окна
        const modalOverlay = document.createElement('div');
        modalOverlay.id = 'modal-overlay';
        modalOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: none;
      z-index: 1000;
    `;

        // Само модальное окно
        const modal = document.createElement('div');
        modal.id = 'instance-modal';
        modal.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      max-width: 600px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
    `;

        modal.innerHTML = `
      <h3 id="modal-title" style="margin: 0 0 20px 0; color: #333;">Модальное окно</h3>
      <div id="modal-fields" style="margin-bottom: 20px;"></div>
      <div style="display: flex; gap: 10px; justify-content: flex-end;">
        <button id="modal-action-btn" style="background: #28a745; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer;">Действие</button>
        <button id="modal-delete-btn" style="background: #dc3545; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer;">Удалить</button>
        <button id="modal-cancel-btn" style="background: #6c757d; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer;">Отмена</button>
      </div>
    `;

        modalOverlay.appendChild(modal);
        document.body.appendChild(modalOverlay);

        // События - добавляем ПОСЛЕ того как элементы добавлены в DOM
        document.getElementById('modal-cancel-btn').addEventListener('click', () => this.close());
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) this.close();
        });
    }

    async openCreateModal() {
        const title = document.getElementById('modal-title');
        const actionBtn = document.getElementById('modal-action-btn');
        const deleteBtn = document.getElementById('modal-delete-btn');

        title.textContent = 'Создание нового экземпляра';
        actionBtn.textContent = 'Создать';
        deleteBtn.style.display = 'none';

        this.show();

        try {
            const metadata = await ApiClient.getMetadata(this.currentManager.name);
            if (!metadata.fields) throw new Error('Не удалось получить метаданные');

            this.renderFields(metadata.fields, 'create');
            actionBtn.onclick = () => this.handleCreate();

        } catch (error) {
            this.showError(`Ошибка загрузки полей: ${error.message}`);
        }
    }

    async openEditModal(uuid) {
        const title = document.getElementById('modal-title');
        const actionBtn = document.getElementById('modal-action-btn');
        const deleteBtn = document.getElementById('modal-delete-btn');

        title.textContent = 'Редактирование экземпляра';
        deleteBtn.style.display = 'inline-block';

        this.show();
        this.showLoading();

        try {
            const result = await ApiClient.selectInstance(this.currentManager.name, uuid);
            if (result.status !== 200) throw new Error(result.message);

            this.currentData = { ...result.data };
            this.renderFieldsWithData(result.data, 'edit');

            if (!this.currentData.deleted) {
                actionBtn.style.display = 'inline-block';
                actionBtn.textContent = 'Обновить';
                actionBtn.onclick = () => {
                    if (actionBtn.title) {
                        alert('Исправьте ошибки валидации перед обновлением');
                        return;
                    }
                    this.handleUpdate(uuid);
                };
            } else {
                actionBtn.style.display = 'none';
            }

            if (result.data.deleted) {
                deleteBtn.textContent = 'Восстановить';
                deleteBtn.onclick = () => this.handleRestore(uuid);
            } else {
                deleteBtn.textContent = 'Удалить';
                deleteBtn.onclick = () => this.handleDelete(uuid);
            }

        } catch (error) {
            this.showError(`Ошибка загрузки: ${error.message}`);
        }
    }


    async validateCode(value, originalValue, currentId = null) {
        const val = value.trim();
        let errorMsg = '';

        if (val.length < 3) return 'Минимум 3 символа';
        if (!/^[a-zA-Z0-9-]*$/.test(val)) return 'Допустимы только латинские буквы, цифры и дефис';

        if (val !== originalValue) {
            try {
                const result = await ApiClient.request('/api/instance/list', {
                    type: 'instance_list',
                    table: 'nomenclature'
                });

                if (result?.data?.length > 0) {
                    const exists = result.data.some(item => item.code?.toLowerCase() === val.toLowerCase() && item.id !== currentId);
                    if (exists) errorMsg = 'Код уже существует';
                }
            } catch (err) {
                console.error('Ошибка проверки уникальности:', err);
                errorMsg = 'Ошибка проверки уникальности';
            }
        }

        return errorMsg;
    }

    async validateIIN(value, originalValue, currentId = null) {
        const val = value.trim();
        let errorMsg = '';

        // Длина и только цифры
        if (val.length !== 12) return 'ИИН должен содержать ровно 12 цифр';
        if (!/^\d{12}$/.test(val)) return 'ИИН может содержать только цифры';

        // Проверка уникальности
        if (val !== originalValue) {
            try {
                const result = await ApiClient.getIndividuals();
                if (result.status === 200 && Array.isArray(result.data)) {
                    const exists = result.data.some(item => item.iin === val && item.id !== currentId);
                    if (exists) errorMsg = 'ИИН уже существует';
                } else {
                    errorMsg = 'Ошибка проверки уникальности ИИН';
                }
            } catch (err) {
                console.error(err);
                errorMsg = 'Ошибка проверки уникальности ИИН';
            }
        }

        return errorMsg;
    }

    createFieldWithValidation(field, value, originalValue = '', mode, currentId = null) {
        const fieldConfig = FIELDS_CONFIG[field.name] || FIELDS_CONFIG._default;
        if (!fieldConfig.visible[mode]) return null;

        const fieldElement = this.createField(field, fieldConfig, value);

        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.style.cssText = 'color: #dc3545; font-size: 12px; margin-top: 4px;';
        fieldElement.appendChild(errorDiv);

        const actionBtn = document.getElementById('modal-action-btn');

        const setupValidation = async (validateFn, val) => {
            const errorMsg = await validateFn(val, originalValue, currentId);
            errorDiv.textContent = errorMsg;
            const input = fieldElement.querySelector('input');
            input.style.borderColor = errorMsg ? '#dc3545' : '#28a745';
            return !errorMsg;
        };

        const input = fieldElement.querySelector('input');

        if (field.name === 'iin') {
            let isValid = true;

            const updateActionState = () => {
                if (isValid) {
                    actionBtn.disabled = false;
                    actionBtn.title = '';
                    actionBtn.style.opacity = '1';
                } else {
                    actionBtn.disabled = true;
                    actionBtn.title = 'Исправьте ошибки валидации';
                    actionBtn.style.opacity = '0.6';
                }
            };

            input.addEventListener('input', async () => {
                isValid = await setupValidation(this.validateIIN.bind(this), input.value);
                updateActionState();
            });

            (async () => {
                isValid = await setupValidation(this.validateIIN.bind(this), value);
                updateActionState();
            })();
        }

        if (field.name === 'code') {
            let isValid = true;

            const updateActionState = () => {
                if (isValid) {
                    actionBtn.disabled = false;
                    actionBtn.title = '';
                    actionBtn.style.opacity = '1';
                } else {
                    actionBtn.disabled = true;
                    actionBtn.title = 'Невозможно обновить: исправьте ошибки валидации';
                    actionBtn.style.opacity = '0.6';
                }
            };

            input.addEventListener('input', async () => {
                isValid = await setupValidation(this.validateCode.bind(this), input.value);
                updateActionState();
            });

            (async () => {
                isValid = await setupValidation(this.validateCode.bind(this), value);
                updateActionState();
            })();
        }

        return fieldElement;
    }

    renderFieldsWithData(data, mode) {
        const container = document.getElementById('modal-fields');
        container.innerHTML = '';

        Object.entries(data).forEach(([fieldName, value]) => {
            const originalValue = value;
            const currentId = data.id || null; // обязательно передаём текущий ID
            const fieldElement = this.createFieldWithValidation({ name: fieldName }, value, originalValue, mode, currentId);
            if (fieldElement) container.appendChild(fieldElement);
        });

        this.addRequiredFieldsNote(container);
    }

    renderFields(fields, mode) {
        const container = document.getElementById('modal-fields');
        container.innerHTML = '';

        fields.forEach(field => {
            const fieldElement = this.createFieldWithValidation(field, null, '', mode);
            if (fieldElement) container.appendChild(fieldElement);
        });

        this.addRequiredFieldsNote(container);
    }


    createField(field, config, value = null) {
        const fieldGroup = document.createElement('div');
        fieldGroup.style.cssText = 'margin-bottom: 15px;';

        const label = document.createElement('label');
        const fieldTitle = config.title || field.name;
        label.textContent = fieldTitle + (config.required ? ' *' : '');
        label.style.cssText = `
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
    color: ${config.required ? '#d63384' : '#333'};
  `;

        const input = document.createElement('input');
        input.name = field.name;
        input.type = config.type || 'text';

        if ((field.name === 'insertdate' || field.name === 'updatedate') && value) {
            const date = new Date(value);
            value = date.toLocaleString();
            input.disabled = true;
            input.style.color = '#6c757d';
        }

        input.value = value || '';
        input.required = config.required;
        input.placeholder = config.placeholder || `Введите ${fieldTitle.toLowerCase()}`;
        input.style.cssText = `
    width: 100%;
    padding: 8px;
    border: 1px solid ${config.required ? '#fd7e14' : '#ddd'};
    border-radius: 4px;
    box-sizing: border-box;
    background: ${config.editable ? 'white' : '#f8f9fa'};
  `;

        if (!config.editable) {
            input.disabled = true;
            input.style.color = '#6c757d';
        }

        fieldGroup.appendChild(label);
        fieldGroup.appendChild(input);
        return fieldGroup;
    }


    addRequiredFieldsNote(container) {
        const noteDiv = document.createElement('div');
        noteDiv.style.cssText = `
      margin-top: 15px;
      padding: 10px;
      background: #fff3cd;
      border: 1px solid #ffeaa7;
      border-radius: 4px;
      font-size: 12px;
      color: #856404;
    `;
        noteDiv.innerHTML = '<strong>*</strong> - обязательные поля для заполнения';
        container.appendChild(noteDiv);
    }

    async handleCreate() {
        const data = this.collectFormData();
        if (!data) return;

        try {
            const result = await ApiClient.insertInstance(this.currentManager.name, data);
            if (result.status === 200) {
                alert('Запись создана');
                this.close();
                this.currentManager.loadData();
            } else {
                alert(`Ошибка: ${result.message}`);
            }
        } catch (err) {
            alert(`Ошибка: ${err.message}`);
        }
    }

    async handleUpdate(uuid) {
        const data = this.collectFormData();
        if (!data) return;

        if (!this.currentData) return;

        const isChanged = Object.keys(data).some(k => data[k] !== this.currentData[k]);
        if (!isChanged) {
            alert('Нет изменений для сохранения');
            return;
        }

        data.updatedate = new Date().toISOString();

        try {
            const result = await ApiClient.updateInstance(this.currentManager.name, uuid, data);
            if (result.status === 200) {
                alert('Обновлено');
                this.close();
                this.currentManager.loadData();
            } else alert(`Ошибка: ${result.message}`);
        } catch (err) {
            alert(`Ошибка: ${err.message}`);
        }
    }

    async handleDelete(uuid) {
        if (!confirm('Удалить запись?')) return;
        if (this.currentManager.name !== 'nomenclature') {
            try {
                const result = await ApiClient.deleteInstance(this.currentManager.name, uuid);
                if (result.status === 200) {
                    alert('Удалено');
                    this.close();
                    this.currentManager.loadData();
                }
            } catch (err) {
                alert(`Ошибка: ${err.message}`);
            }
        } else {
            try {
                const result = await ApiClient.updateInstance(this.currentManager.name, uuid, { deleted: true });
                if (result.status === 200) {
                    alert('Удалено');
                    this.close();
                    this.currentManager.loadData();
                }
            } catch (err) {
                alert(`Ошибка: ${err.message}`);
            }
        }
    }

    async handleRestore(uuid) {
        if (!confirm('Восстановить запись?')) return;
        try {
            const result = await ApiClient.updateInstance(this.currentManager.name, uuid, { deleted: false });
            if (result.status === 200) {
                alert('Восстановлено');
                this.close();
                this.currentManager.loadData();
            }
        } catch (err) {
            alert(`Ошибка: ${err.message}`);
        }
    }

    collectFormData() {
        const inputs = document.querySelectorAll('#modal-fields input:not([disabled])');
        const data = {};
        let hasRequired = true;
        const missing = [];

        inputs.forEach(input => {
            const fieldConfig = FIELDS_CONFIG[input.name] || FIELDS_CONFIG._default;
            const val = input.value.trim();
            if (fieldConfig.required && !val) {
                hasRequired = false;
                missing.push(fieldConfig.title || input.name);
                input.style.borderColor = '#dc3545';
            } else {
                input.style.borderColor = fieldConfig.required ? '#fd7e14' : '#ddd';
            }
            if (val !== '') data[input.name] = val;
        });

        if (!hasRequired) {
            alert(`Заполните: ${missing.join(', ')}`);
            return null;
        }
        if (!Object.keys(data).length) {
            alert('Нет данных для сохранения');
            return null;
        }
        return data;
    }

    show() {
        document.getElementById('modal-overlay').style.display = 'block';
    }

    close() {
        document.getElementById('modal-overlay').style.display = 'none';
    }

    showLoading() {
        document.getElementById('modal-fields').innerHTML = '<p>Загрузка данных...</p>';
    }

    showError(message) {
        document.getElementById('modal-fields').innerHTML = `<p style="color: red;">${message}</p>`;
    }
}
