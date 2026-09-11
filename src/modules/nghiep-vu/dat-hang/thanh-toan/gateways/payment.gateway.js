'use strict';

class PaymentGateway {
    async create() {
        throw new Error('Gateway chưa triển khai phương thức create().');
    }
}

module.exports = PaymentGateway;
