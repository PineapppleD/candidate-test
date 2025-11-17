import ApiClient from '../api/ApiCilent.js';
import { FIELDS_CONFIG } from '../config/filedsConfig.js';
import NomenclatureManager from './NomenclatureManager.js';

// Класс для управления модальными окнами
export default class ModalManager {
    constructor(nomenclatureManager = null) {
        this.createModalStructure();
        this.nomenclatureManager = nomenclatureManager;
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
            const metadata = await ApiClient.getMetadata('nomenclature');
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
        actionBtn.textContent = 'Обновить';
        deleteBtn.style.display = 'inline-block';

        this.show();
        this.showLoading();

        try {
            const result = await ApiClient.selectInstance('nomenclature', uuid);
            if (result.status !== 200) throw new Error(result.message);

            // Сохраняем оригинальные данные для проверки изменений
            this.currentData = { ...result.data };

            this.renderFieldsWithData(result.data, 'edit');

            actionBtn.onclick = () => {
                if (actionBtn.title) {
                    alert('Исправьте ошибки валидации перед обновлением');
                    return;
                }
                this.handleUpdate(uuid);
            };
            deleteBtn.onclick = () => this.handleDelete(uuid);
        } catch (error) {
            this.showError(`Ошибка загрузки: ${error.message}`);
        }
    }


    async validateCode(value, originalValue) {
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
                    const codeExists = result.data.some(item => item.code?.toLowerCase() === val.toLowerCase())
                    if (codeExists) {
                        errorMsg = 'Код уже существует';
                    }
                }
            } catch (err) {
                console.error('Ошибка проверки уникальности:', err);
                errorMsg = 'Ошибка проверки уникальности';
            }
        }

        return errorMsg;
    }

    createFieldWithValidation(field, value, originalValue, mode) {
        const fieldConfig = FIELDS_CONFIG[field.name] || FIELDS_CONFIG._default;
        if (!fieldConfig.visible[mode]) return null;

        const fieldElement = this.createField(field, fieldConfig, value);

        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.style.cssText = 'color: #dc3545; font-size: 12px; margin-top: 4px;';
        fieldElement.appendChild(errorDiv);

        const actionBtn = document.getElementById('modal-action-btn');

        if (field.name === 'code') {
            let isCodeValid = true;

            const updateActionButtonState = () => {
                if (isCodeValid) {
                    actionBtn.disabled = false;
                    actionBtn.title = '';
                    actionBtn.style.opacity = '1';
                } else {
                    actionBtn.disabled = false; // можно кликать, но визуально неактивно
                    actionBtn.title = 'Невозможно обновить: исправьте ошибки валидации';
                    actionBtn.style.opacity = '0.6';
                }
            };

            const validateAndUpdate = async (val) => {
                const errorMsg = await this.validateCode(val, originalValue);
                errorDiv.textContent = errorMsg;
                const input = fieldElement.querySelector('input');
                input.style.borderColor = errorMsg ? '#dc3545' : '#28a745';
                isCodeValid = !errorMsg;
                updateActionButtonState();
            };

            const input = fieldElement.querySelector('input');
            input.addEventListener('input', async () => validateAndUpdate(input.value));
            (async () => await validateAndUpdate(value))();
        }

        return fieldElement;
    }

    renderFieldsWithData(data, mode) {
        const container = document.getElementById('modal-fields');
        container.innerHTML = '';

        Object.entries(data).forEach(([fieldName, value]) => {
            const fieldElement = this.createFieldWithValidation({ name: fieldName }, value, data.code, mode);
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

        // --- Форматируем даты красиво ---
        if ((field.name === 'insertdate' || field.name === 'updatedate') && value) {
            const date = new Date(value);
            value = date.toLocaleString(); // например: "17.11.2025, 15:10:29"
            input.disabled = true; // дату нельзя редактировать вручную
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
            const result = await ApiClient.insertInstance('nomenclature', data);
            if (result.status === 200) {
                alert('Запись успешно создана');
                this.close();
                this.nomenclatureManager.loadData();
            } else {
                alert(`Ошибка создания: ${result.message}`);
            }
        } catch (error) {
            alert(`Ошибка: ${error.message}`);
        }
    }

    async handleUpdate(uuid) {
        const newData = this.collectFormData();
        if (!newData) return;

        const oldData = this.currentData || {};

        const isChanged = Object.keys(newData).some(key => {
            return key !== 'updatedate' && newData[key] !== oldData[key];
        });

        if (!isChanged) {
            alert('Нет изменений для сохранения');
            return;
        }

        newData.updatedate = new Date().toISOString();

        try {
            const result = await ApiClient.updateInstance('nomenclature', uuid, newData);
            if (result.status === 200) {
                alert('Запись успешно обновлена');
                this.close();
                this.nomenclatureManager.loadData();
            } else {
                alert(`Ошибка обновления: ${result.message}`);
            }
        } catch (error) {
            alert(`Ошибка: ${error.message}`);
        }
    }

    async handleDelete(uuid) {
        if (!confirm('Вы уверены что хотите удалить эту запись?')) return;

        try {
            const result = await ApiClient.deleteInstance('nomenclature', uuid);
            if (result.status === 200) {
                alert('Запись успешно удалена');
                this.close();
                this.nomenclatureManager.loadData();
            } else {
                alert(`Ошибка удаления: ${result.message}`);
            }
        } catch (error) {
            alert(`Ошибка: ${error.message}`);
        }
    }

    collectFormData() {
        const inputs = document.querySelectorAll('#modal-fields input:not([disabled])');
        const data = {};
        let hasRequiredFields = true;
        const missingFields = [];

        inputs.forEach(input => {
            const fieldConfig = FIELDS_CONFIG[input.name] || FIELDS_CONFIG._default;
            const value = input.value.trim();

            if (fieldConfig.required && !value) {
                hasRequiredFields = false;
                missingFields.push(fieldConfig.title || input.name);
                input.style.borderColor = '#dc3545';
            } else {
                input.style.borderColor = fieldConfig.required ? '#fd7e14' : '#ddd';
            }

            if (value !== '') {
                data[input.name] = value;
            }
        });

        if (!hasRequiredFields) {
            alert(`Заполните обязательные поля: ${missingFields.join(', ')}`);
            return null;
        }

        if (Object.keys(data).length === 0) {
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
