const ApiError = require('../utils/api-error');

const authRepository = require('../modules/danh-muc/nhan-su/xac-thuc/xac-thuc.repository');

function normalizePermission(value) {
    return String(value || '')
        .trim()
        .toUpperCase();
}

function authorize(...requiredPermissions) {
    const permissionsRequired = [...new Set(requiredPermissions.map(normalizePermission).filter(Boolean))];

    return async (req, res, next) => {
        try {
            /*
             * ========================================
             * 1. BẮT BUỘC ĐÃ AUTHENTICATE
             * ========================================
             */
            const user = req.user;

            if (!user || !user.taiKhoanId) {
                throw new ApiError(401, 'Chưa đăng nhập.');
            }

            /*
             * ========================================
             * 2. ROUTE PHẢI KHAI BÁO QUYỀN
             * ========================================
             */
            if (permissionsRequired.length === 0) {
                throw new ApiError(500, 'API chưa được cấu hình quyền truy cập.');
            }

            /*
             * ========================================
             * 3. LẤY QUYỀN HIỆN TẠI TỪ DB
             *
             * Một request có thể chạy:
             *
             * authorize("Q000067")
             * authorize("Q000032", ...)
             *
             * nên chỉ query DB 1 lần/request.
             * ========================================
             */
            let permissions = req.authorizationPermissions;

            if (!(permissions instanceof Set)) {
                const dsMaQuyen = await authRepository.getMaQuyenHienTai(user.taiKhoanId);

                permissions = new Set(dsMaQuyen.map(normalizePermission).filter(Boolean));

                req.authorizationPermissions = permissions;

                /*
                 * Đồng bộ lại req.user để các middleware /
                 * controller phía sau có quyền mới nhất.
                 */
                req.user.permissions = [...permissions];
            }

            /*
             * ========================================
             * 4. KIỂM TRA:
             *
             * authorize(A, B, C)
             *
             * = A OR B OR C
             * ========================================
             */
            const hasPermission = permissionsRequired.some((permission) => permissions.has(permission));

            if (!hasPermission) {
                throw new ApiError(403, 'Bạn không có quyền truy cập.');
            }

            return next();
        } catch (error) {
            return next(error);
        }
    };
}

module.exports = authorize;
