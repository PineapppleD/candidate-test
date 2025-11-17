// Конфигурация колонок таблицы
export const TABLE_CONFIG = {
    columns: {
        id: {
            title: 'ID',
            width: '80px',
            align: 'center',
            visible: true
        },
        represent: {
            title: 'Название',
            width: 'auto',
            align: 'left',
            visible: true
        }
    },
    tableStyle: {
        width: '100%',
        borderCollapse: 'collapse',
        marginTop: '20px'
    },
    headerStyle: {
        background: '#f8f9fa',
        fontWeight: 'bold'
    },
    cellStyle: {
        border: '1px solid #ddd',
        padding: '12px'
    }
};