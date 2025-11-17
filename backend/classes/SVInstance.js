const pg = require('../db/pg');
const Metadata = require('../controllers/Metadata');

module.exports = class SVInstance {
    constructor(req, res, next) {
        this.error = {};
    }

    // Получение экземпляра по UUID
    select = async (tableKey, uuid, req, res, next) => {
        const meta = Metadata.getTableMetadata(tableKey);
        if (!meta) {
            return { status: 400, message: 'Unknown table' };
        }

        // Получаем префикс таблицы (до первого __)
        const tablePrefix = meta.realTable.split('__')[0];
        const uuidField = `${tablePrefix}__uuid`;

        // Берём ВСЕ поля
        const allFields = Object.values(meta.fields);
        if (!allFields.length) {
            return { status: 400, message: 'No fields' };
        }

        const fieldsSql = allFields.map(v => `"${v.db}" AS "${v.db.replace(/^.*__/, '')}"`);
        const sql = `SELECT ${fieldsSql.join(', ')} FROM "${meta.realTable}" WHERE "${uuidField}" = $1`;
        
        try {
            const dbRes = await pg.query(sql, [uuid]);
            if (dbRes.rows.length === 0) {
                return { status: 404, message: 'Record not found' };
            }
            return { status: 200, message: 'OK', data: dbRes.rows[0] };
        } catch (e) {
            return { status: 500, message: e.message };
        }
    }

    // Создание нового экземпляра
    insert = async (tableKey, data, req, res, next) => {
        const meta = Metadata.getTableMetadata(tableKey);
        if (!meta) {
            return { status: 400, message: 'Unknown table' };
        }

        // Получаем префикс таблицы (до первого __)
        const tablePrefix = meta.realTable.split('__')[0];
        const idField = `${tablePrefix}__id`;
        const uuidField = `${tablePrefix}__uuid`;

        // Берём ВСЕ поля для записи
        const allFields = Object.entries(meta.fields);
        if (!allFields.length) {
            return { status: 400, message: 'No fields' };
        }

        // Проверяем какие поля пришли в данных
        const fieldsToInsert = [];
        const valuesToInsert = [];
        const placeholders = [];
        let paramCounter = 1;

        for (const [cleanName, fieldMeta] of allFields) {
            // Пропускаем id и uuid - они генерируются автоматически
            if (cleanName === 'id' || cleanName === 'uuid') continue;
            
            if (data.hasOwnProperty(cleanName)) {
                fieldsToInsert.push(`"${fieldMeta.db}"`);
                valuesToInsert.push(data[cleanName]);
                placeholders.push(`$${paramCounter++}`);
            }
        }

        if (fieldsToInsert.length === 0) {
            return { status: 400, message: 'No valid fields provided' };
        }

        const sql = `INSERT INTO "${meta.realTable}" (${fieldsToInsert.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING "${uuidField}" AS uuid`;
        
        try {
            const dbRes = await pg.query(sql, valuesToInsert);
            const newUuid = dbRes.rows[0].uuid;
            
            // Возвращаем созданную запись
            return await this.select(tableKey, newUuid, req, res, next);
        } catch (e) {
            return { status: 500, message: e.message };
        }
    }

    // Обновление экземпляра
    update = async (tableKey, uuid, data, req, res, next) => {
        const meta = Metadata.getTableMetadata(tableKey);
        if (!meta) {
            return { status: 400, message: 'Unknown table' };
        }

        // Получаем префикс таблицы (до первого __)
        const tablePrefix = meta.realTable.split('__')[0];
        const idField = `${tablePrefix}__id`;
        const uuidField = `${tablePrefix}__uuid`;

        // Проверяем что запись существует
        const existingRecord = await this.select(tableKey, uuid, req, res, next);
        if (existingRecord.status !== 200) {
            return existingRecord;
        }

        // Берём ВСЕ поля для обновления
        const allFields = Object.entries(meta.fields);
        const setClause = [];
        const values = [];
        let paramCounter = 1;

        for (const [cleanName, fieldMeta] of allFields) {
            // Пропускаем id и uuid - их нельзя менять
            if (cleanName === 'id' || cleanName === 'uuid') continue;
            
            if (data.hasOwnProperty(cleanName)) {
                setClause.push(`"${fieldMeta.db}" = $${paramCounter++}`);
                values.push(data[cleanName]);
            }
        }

        if (setClause.length === 0) {
            return { status: 400, message: 'No valid fields provided for update' };
        }

        values.push(uuid); // UUID для WHERE
        const sql = `UPDATE "${meta.realTable}" SET ${setClause.join(', ')} WHERE "${uuidField}" = $${paramCounter}`;
        
        try {
            await pg.query(sql, values);
            
            // Возвращаем обновленную запись
            return await this.select(tableKey, uuid, req, res, next);
        } catch (e) {
            return { status: 500, message: e.message };
        }
    }

    // Удаление экземпляра
    delete = async (tableKey, uuid, req, res, next) => {
        const meta = Metadata.getTableMetadata(tableKey);
        if (!meta) {
            return { status: 400, message: 'Unknown table' };
        }

        // Получаем префикс таблицы (до первого __)
        const tablePrefix = meta.realTable.split('__')[0];
        const uuidField = `${tablePrefix}__uuid`;

        // Проверяем что запись существует
        const existingRecord = await this.select(tableKey, uuid, req, res, next);
        if (existingRecord.status !== 200) {
            return existingRecord;
        }

        const sql = `DELETE FROM "${meta.realTable}" WHERE "${uuidField}" = $1`;
        
        try {
            const dbRes = await pg.query(sql, [uuid]);
            if (dbRes.rowCount === 0) {
                return { status: 404, message: 'Record not found' };
            }
            return { status: 200, message: 'Record deleted successfully', data: { uuid: uuid } };
        } catch (e) {
            return { status: 500, message: e.message };
        }
    }
};

