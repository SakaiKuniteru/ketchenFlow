"use strict";

const QRCode =
    require(
        "qrcode"
    );

const ApiError =
    require(
        "../../../../utils/api-error"
    );


class QrPaymentGateway {

    getProvider() {

        return String(
            process.env
                .QR_PAYMENT_PROVIDER ||
            "TEST"
        )
            .trim()
            .toUpperCase();

    }


    async create({
        maGiaoDich,
        soTien,
        soPhieu
    }) {

        const provider =
            this.getProvider();


        if (
            provider ===
            "VIETQR"
        ) {

            return await this
                .createVietQr({
                    maGiaoDich,
                    soTien,
                    soPhieu
                });

        }


        return await this
            .createTestQr({
                maGiaoDich,
                soTien,
                soPhieu
            });

    }


    async createTestQr({
        maGiaoDich,
        soTien,
        soPhieu
    }) {

        const payload = [
            "KITCHENFLOW-TEST",
            `TX=${maGiaoDich}`,
            `AMOUNT=${Math.round(
                Number(
                    soTien
                )
            )}`,
            `REF=${soPhieu || ""}`
        ].join(
            "|"
        );


        const qrDataURL =
            await QRCode
                .toDataURL(
                    payload,
                    {
                        width:
                            460,

                        margin:
                            1,

                        errorCorrectionLevel:
                            "M"
                    }
                );


        return {

            provider:
                "TEST",

            bankName:
                "KITCHENFLOW TEST BANK",

            accountName:
                "KITCHENFLOW TEST",

            accountNo:
                "0000000000",

            maGiaoDich,

            soTien:
                Number(
                    soTien
                ),

            qrCode:
                payload,

            qrDataURL

        };

    }


    async createVietQr({
        maGiaoDich,
        soTien
    }) {

        const clientId =
            String(
                process.env
                    .VIETQR_CLIENT_ID ||
                ""
            ).trim();

        const apiKey =
            String(
                process.env
                    .VIETQR_API_KEY ||
                ""
            ).trim();

        const accountNo =
            String(
                process.env
                    .VIETQR_ACCOUNT_NO ||
                ""
            ).trim();

        const accountName =
            String(
                process.env
                    .VIETQR_ACCOUNT_NAME ||
                ""
            ).trim();

        const acqId =
            Number(
                process.env
                    .VIETQR_ACQ_ID
            );


        if (
            !clientId ||
            !apiKey ||
            !accountNo ||
            !Number.isInteger(
                acqId
            )
        ) {

            throw new ApiError(
                500,
                "Chưa cấu hình đầy đủ VietQR."
            );

        }


        let response;


        try {

            response =
                await fetch(
                    "https://api.vietqr.io/v2/generate",
                    {
                        method:
                            "POST",

                        headers: {
                            "Content-Type":
                                "application/json",

                            "x-client-id":
                                clientId,

                            "x-api-key":
                                apiKey
                        },

                        body:
                            JSON.stringify({
                                accountNo,

                                accountName:
                                    accountName ||
                                    undefined,

                                acqId,

                                amount:
                                    Math.round(
                                        Number(
                                            soTien
                                        )
                                    ),

                                addInfo:
                                    String(
                                        maGiaoDich
                                    )
                                        .replace(
                                            /[^A-Za-z0-9]/g,
                                            ""
                                        )
                                        .slice(
                                            0,
                                            25
                                        ),

                                format:
                                    "text",

                                template:
                                    "compact"
                            })
                    }
                );

        } catch (
            error
        ) {

            console.error(
                "Không kết nối được VietQR:",
                error
            );

            throw new ApiError(
                502,
                "Không kết nối được dịch vụ tạo QR."
            );

        }


        let result;


        try {

            result =
                await response.json();

        } catch {

            throw new ApiError(
                502,
                "Dịch vụ QR trả dữ liệu không hợp lệ."
            );

        }


        if (
            !response.ok ||
            String(
                result?.code
            ) !==
                "00" ||
            !result?.data
                ?.qrDataURL
        ) {

            throw new ApiError(
                502,
                result?.desc ||
                "Không tạo được mã QR."
            );

        }


        return {

            provider:
                "VIETQR",

            bankBin:
                acqId,

            accountName:
                result.data
                    .accountName ||
                accountName ||
                "",

            accountNo:
                this.maskAccountNo(
                    accountNo
                ),

            maGiaoDich,

            soTien:
                Number(
                    soTien
                ),

            qrCode:
                result.data
                    .qrCode,

            qrDataURL:
                result.data
                    .qrDataURL

        };

    }


    async cancel({
        maGiaoDich
    }) {

        /*
         * TEST/VietQR generate không có
         * payment-session cần hủy phía provider.
         *
         * Việc hủy thực hiện ở transaction
         * KitchenFlow.
         *
         * Sau này tích hợp payment gateway
         * có API cancel thì xử lý tại đây.
         */

        return {

            success:
                true,

            maGiaoDich

        };

    }


    maskAccountNo(
        value
    ) {

        const text =
            String(
                value ||
                ""
            );


        if (
            text.length <=
            4
        ) {

            return text;

        }


        return (
            "*".repeat(
                Math.max(
                    0,
                    text.length -
                    4
                )
            ) +
            text.slice(
                -4
            )
        );

    }

}


module.exports =
    new QrPaymentGateway();