export const INDIVIDUALS_TABLE_CONFIG = {
    columns: {
        id: { title: 'ID', width: '60px', visible: true },
        iin: { title: 'ИИН', width: '130px', visible: true },
        represent: { title: 'ФИО', width: 'auto', visible: true }
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