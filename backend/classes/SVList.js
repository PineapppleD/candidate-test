
const pg = require('../db/pg');
const Metadata = require('../controllers/Metadata');


module.exports = class SVList {
    constructor(req, res, next) {
        this.error = {};
    }  

    // Универсальный метод для получения списка по метаданным
    selectByMeta = async (tableKey, req, res, next) => {
        const meta = Metadata.getTableMetadata(tableKey);
        if (!meta) {
            return { status: 400, message: 'Unknown table' };
        }
        console.log('meta',meta);
        // Берём все поля
        const fieldsArr = Object.values(meta.fields);
        if (!fieldsArr.length) {
            return { status: 400, message: 'No fields' };
        }
        const fieldsSql = fieldsArr.map(v => `"${v.db}" AS "${v.db.replace(/^.*__/, '')}"`); // alias = чистое имя
        const sql = `SELECT ${fieldsSql.join(', ')} FROM "${meta.realTable}" ORDER BY 1 DESC`;
        try {
            const dbRes = await pg.query(sql, []);
            return { status: 200, message: 'OK', data: dbRes.rows };
        } catch (e) {
            return { status: 500, message: e.message };
        }
    }

    // Получение списка экземпляров с пагинацией
    getList = async (tableKey, options = {}, req, res, next) => {
        const meta = Metadata.getTableMetadata(tableKey);
        if (!meta) {
            return { status: 400, message: 'Unknown table' };
        }

        // Берём все поля
        const fieldsArr = Object.values(meta.fields);
        if (!fieldsArr.length) {
            return { status: 400, message: 'No fields' };
        }

        const fieldsSql = fieldsArr.map(v => `"${v.db}" AS "${v.db.replace(/^.*__/, '')}"`);
        
        // Пагинация
        const limit = options.limit || 50;
        const offset = options.offset || 0;
        
        const sql = `SELECT ${fieldsSql.join(', ')} FROM "${meta.realTable}" ORDER BY id DESC LIMIT $1 OFFSET $2`;
        
        try {
            const dbRes = await pg.query(sql, [limit, offset]);
            return { 
                status: 200, 
                message: 'OK', 
                data: dbRes.rows,
                pagination: {
                    limit,
                    offset,
                    count: dbRes.rows.length
                }
            };
        } catch (e) {
            return { status: 500, message: e.message };
        }
    }

    // Пример: получение списка номенклатур через метаданные
    selectNomenclature = async (req, res, next, userData) => {
        return this.selectByMeta('nomenclature', req, res, next);
    }
};