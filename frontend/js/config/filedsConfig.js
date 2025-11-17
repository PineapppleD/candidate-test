// Конфигурация полей для форм
export const FIELDS_CONFIG = {
    id: {
        editable: false,
        visible: { create: false, edit: true },
        required: false,
        type: 'text',
        title: 'ID'
    },
    uuid: {
        editable: false,
        visible: { create: false, edit: true },
        required: false,
        type: 'text',
        title: 'UUID'
    },
    code: {
        editable: true,
        visible: { create: true, edit: true },
        required: false,
        type: 'text',
        title: 'Код',
        placeholder: 'Введите уникальный код'
    },
    represent: {
        editable: true,
        visible: { create: true, edit: true },
        required: true,
        type: 'text',
        title: 'Название',
        placeholder: 'Введите название'
    },
    // Дефолтная конфигурация для остальных полей
    _default: {
        editable: true,
        visible: { create: true, edit: true },
        required: false,
        type: 'text',
        title: null,
        placeholder: null
    }
};