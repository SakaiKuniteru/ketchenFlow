const enums = require('../../../../constants/enums');

class EnumService {
    get(name) {
        return enums[name] || [];
    }

    getAll() {
        return enums;
    }
}

module.exports = new EnumService();
