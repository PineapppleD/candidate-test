const utils = require('../utils/utils');
const SVList = require('../classes/SVList');
const SVInstance = require('../classes/SVInstance');
const CONST = require('../utils/CONST');
const SVLocale = require('../utils/SVLocale');
const customError = require('../utils/customError');

exports.doTestEvent = utils.catchAsync(async (req, res, next) => {
    const serverTime = new Date();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
        time: serverTime,
        timezone: -(serverTime.getTimezoneOffset() / 60),
        status: 200,
        msg: "TEST OK"
    }));
});

exports.doGet = utils.catchAsync(async (req, res, next) => {
    res.writeHead(CONST.HTTPSTATUSES.ERRORS.MethodNotAllowed.code, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
        status: CONST.HTTPSTATUSES.ERRORS.MethodNotAllowed.code,
        msg: `${CONST.HTTPSTATUSES.ERRORS.MethodNotAllowed.name} (${SVLocale.translate("method GET not allowed")})`
    }));
});

exports.doEvent = utils.catchAsync(async (req, res, next) => {
    let funcResult = {};
    if (req.body && req.body.type === "test") {
        const serverTime = new Date();
        funcResult = {
            time: serverTime,
            timezone: -(serverTime.getTimezoneOffset() / 60),
            status: 200,
            msg: "TEST OK"
        };
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(funcResult));
        return;
    }

    const svList = new SVList(req, res, next);
    const svInstance = new SVInstance(req, res, next);

    switch (req.body && req.body.type) {
        case 'system':
            funcResult = await svList.select(req, res, next);
            break;
        case 'nomenclature':
            funcResult = await svList.selectNomenclature(req, res, next);
            break;
        case 'individuals':
            funcResult = await svList.selectIndividuals(req, res, next);
            break;
        case 'staffers':
            funcResult = await svList.selectStaffers(req, res, next);
            break;
        
        // CRUD операции для экземпляров (по UUID)
        case 'instance_select':
            funcResult = await svInstance.select(req.body.table, req.body.uuid, req, res, next);
            break;
        case 'instance_insert':
            funcResult = await svInstance.insert(req.body.table, req.body.data, req, res, next);
            break;
        case 'instance_update':
            funcResult = await svInstance.update(req.body.table, req.body.uuid, req.body.data, req, res, next);
            break;
        case 'instance_delete':
            funcResult = await svInstance.delete(req.body.table, req.body.uuid, req, res, next);
            break;
        case 'instance_list':
            funcResult = await svList.getList(
                req.body.table, 
                req.body.options || {}, 
                req, res, next
            );
            break;
            
        default:
            funcResult = { status: 400, message: 'Unknown type' };
    }

    if (funcResult.statusCode) {
        customError({
            res: res, statusCode: funcResult.statusCode, json: {
                message: funcResult.message
            }
        });
    } else {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(funcResult));
    }
});
